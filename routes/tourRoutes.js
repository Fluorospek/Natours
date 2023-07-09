const express = require('express');
const fs = require('fs');
const tourController = require('./../controller/tourController');
const tourRouter = express.Router();
const authController = require('./../controller/authenticationController');

//tourRouter.param("id", tourController.checkID);

//aliasing
tourRouter
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

tourRouter.route('/tour-stats').get(tourController.getTourStats);

tourRouter.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

tourRouter
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

tourRouter
  .route('/:id')
  .get(tourController.getSpecificTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictedTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = tourRouter;
