const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
// const Waiter = require(appRoot + '/src/model/waiter');
// const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
// const constant = require(appRoot + '/src/constant');
// const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
// const mongoose = require('mongoose');
// const User = require(appRoot + '/src/model/user');
// const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const WaitersJobForm = require(appRoot + '/src/model/waiter-job-form');

exports.validateWaiterFormByIds = async (req, res, next) => {
  try {
    logger.info('starting [validateWaiterFormByIds]');
    const ids = req.body.ids;
    for (const id of ids) {
      const isFormsId = await WaitersJobForm.findById(id);
      if (!isFormsId) {
        return res.status(404).json({
          message: 'Invalid Request. waiter form not found',
        });
      }
    }
    if (!Array.isArray(ids)) {
      logger.info(`Invalid Request. ids should be an array.`);
      return res.status(404).json({
        message: 'Invalid Request. ids should be an array.',
      });
    }
    next();
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
