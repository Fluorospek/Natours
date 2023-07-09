//configurations for express
const { fail } = require('assert');
const express = require('express');
const app = express();
const fs = require('fs');
const morgan = require('morgan');
const AppErr = require('./utils/apperror');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const errorHandler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');

//1) MIDDLEWARES
app.use(helmet());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'Too many requests from this IP, please try again in an hour'
})

app.use('/api',limiter);


app.use(express.json({limit:'10kb'}));

//data sanitization against NoSQL query injection
app.use(mongoSanitize());

//data sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp({
  whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}));

//serving static files
app.use(express.static(`${__dirname}/public`));

//next signifies that it is a middleware function
app.use((req, res, next) => {
  console.log('This is the middleware');
  next();
});

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// app.get('/',(req,res)=>{
//     res.status(200).json({message:'Hello from the server',app:'naturous'});
// });

// app.put('/',(req,res)=>{
//     res.status(200).send('This is the end point');
// })

//JSON.parse so that the json in the file is converted to an array of javascript object

//3) ROUTES

//to get the list of all tours
// app.get("/api/v1/tours", getAllTours);
// app.get("/api/v1/tours/:id", getSpecificTour);
// app.post("/api/v1/tours", createTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

//mounting the routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err=new Error(`Can't find ${req.originalUrl} on this server`);
  // err.statusCode=404;
  // err.status='fail';

  next(new AppErr(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

//4) START SERVER

module.exports = app;
