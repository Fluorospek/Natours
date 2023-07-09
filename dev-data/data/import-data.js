const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const Tour = require('./../../models/tourModel');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );
//.connect returns a promise
mongoose
  .connect(
    'mongodb+srv://tanmaydeshkar:wxMKSF3oUKSUWdAO@cluster0.1nqddma.mongodb.net/natours?retryWrites=true&w=majority'
  )
  .then(() => console.log('Connection is successful'));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data succesfully loaded into Database');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data succesfully deleted from Database');
  } catch (err) {
    console.log(err); 
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
