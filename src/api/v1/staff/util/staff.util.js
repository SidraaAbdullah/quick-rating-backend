const appRoot = require('app-root-path');
// const { getUserWaiterRating } = require('../../waiters/util/waiters.util');
// const WaiterVotingUtil = require(appRoot + '/src/api/v1/waiters-voting/util/waiter-voting-util');
const logger = require(appRoot + '/src/logger').apiLogger;
// const Waiter = require(appRoot + '/src/model/waiter');
// const WaiterJobForm = require(appRoot + '/src/model/waiter-job-form');
// const constant = require(appRoot + '/src/constant');
// const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
// const User = require(appRoot + '/src/model/user');
// const Restaurant = require(appRoot + '/src/model/waiter-restaurant');

// In this method we will build query to find waiters
exports.buildQuery = async (params, user) => {
  try {
    let query = {
      manager_id: user.id,
    };

    if (params.search) {
      query = {
        ...query,
        full_name: { $regex: params.search.trim(), $options: 'i' },
      };
    }
    if (params.type?.length) {
      query = {
        ...query,
        type: { $in: params.type },
      };
    }

    return query;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
  }
};
