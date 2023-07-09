const express = require('express');
const fs = require('fs');
const userController = require('./../controller/userController');
const authController = require('./../controller/authenticationController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);

userRouter.post('/forgotpassword', authController.forgotPassword);
userRouter.patch('/resetpassword/:token', authController.resetPassword);
userRouter.patch('/updatepassword',authController.protect,authController.updatePassword);
userRouter.patch('/updateme',authController.protect,userController.updateMe);
userRouter.delete('/deleteme',authController.protect,userController.deleteMe);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
