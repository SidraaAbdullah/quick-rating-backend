const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const Waiter = require(appRoot + '/src/model/waiter');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const constant = require(appRoot + '/src/constant');
const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
const mongoose = require('mongoose');
const User = require(appRoot + '/src/model/user');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');

exports.validateWaiterByParams = async (req, res, next) => {
  try {
    logger.info('starting [validateWaiterByParams]');
    const id = req.params.id;
    const waiter = await Waiter.findById(id);
    if (!waiter) {
      return res.status(404).json({
        message: 'Invalid Request. waiter not found.',
      });
    }
    logger.info(`waiter found with id:${waiter._id}`);
    next();
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
