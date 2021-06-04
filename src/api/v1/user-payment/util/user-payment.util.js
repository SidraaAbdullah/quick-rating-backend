const appRoot = require('app-root-path');
const { uploadFile } = require(appRoot + '/src/util/s3-upload');
const logger = require(appRoot + '/src/logger').apiLogger;
const constant = require(appRoot + '/src/constant');
const User = require(appRoot + '/src/model/user');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const Waiter = require(appRoot + '/src/model/waiter');
const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
const Util = require(appRoot + '/src/util');
const UserPayMethods = require(appRoot + '/src/model/user-payment-methods');

// In this method we will get users against query
exports.userIsCardInDb = async (user) => {
  try {
    const isCard = await UserPayMethods.findOne({ user_id: user._id, type: 'card' });
    return isCard;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return [];
  }
};
