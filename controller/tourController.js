const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apifeatures');
const AppErr = require('./../utils/apperror');
const catchAsync = require('./../utils/catchAsync');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   if (req.params.id * 1 > Object.keys(tours).length) {
//     res.status(404).json({
//       status: "fail",
//       message: "failed to read data",
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name/price',
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // const tours = await Tour.find({duration: 5, difficulty: 'easy'});

  // const tours=await Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

  //1A) FILTERING
  // const objQuery = { ...req.query };
  // const excludeFields = ['page', 'limit', 'fields'];
  // excludeFields.forEach((el) => delete objQuery[el]);
  // console.log(req.query, objQuery);

  // //1B) ADVANCED FILTERING
  // let queryStr = JSON.stringify(objQuery);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // console.log(JSON.parse(queryStr));
  // //{difficulty:'easy',duration:{$gte:5}}
  // let query = Tour.find(JSON.parse(queryStr));

  //2) PAGINATION
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) throw new Error('This page does not exist');
  // }

  //3) SORTING
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   console.log(sortBy);
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt _id');
  // }

  //4) FIELD LIMITING
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');
  // }

  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .paginate()
    .sort()
    .limitFields();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.lenght,
    data: {
      tours,
    },
  });
});

exports.getSpecificTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  //Tour.findOne({_id:req.params.id})

  if (!tour) {
    return next(new AppErr('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  //const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  // //if(id>tours.lenght){}
  // if (!tour) {
  //   return res.status(404).json({
  //     message: "fail",
  //   });
  // }
});

exports.createTour = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  // const newID = tours[Object.keys(tours).length - 1]?.id + 1;
  // const newTour = Object.assign({ id: newID }, req.body); //object.assign allows us to create a new object by merging to existing objects
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: "success",
  //       data: {
  //         tour: newTour,
  //       },
  //     });
  //   }
  // );
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppErr('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'successful',
    data: {
      tour: tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour=await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppErr('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, //1 added for each document that goes through the pipeline
        numRatings: { $sum: '$ratingsQuantity' },
        avrRatings: { $avg: '$ratingsAverage' },
        avrPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { minPrice: -1 },
    },
    // {
    //   $match:{_id:{$ne:'EASY'}},
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
