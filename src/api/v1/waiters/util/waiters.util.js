const appRoot = require('app-root-path');
const WaiterVotingUtil = require(appRoot + '/src/api/v1/waiters-voting/util/waiter-voting-util');
const logger = require(appRoot + '/src/logger').apiLogger;
const Waiter = require(appRoot + '/src/model/waiter');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const constant = require(appRoot + '/src/constant');
const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
const User = require(appRoot + '/src/model/user');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');

exports.getWaitersToRestaurant = async ({ records_per_page, page_no, sortByUser, query }) => {
  try {
    let restaurantWaiters;

    if (records_per_page && page_no) {
      const skipPage = parseInt(page_no) - 1;
      const limitPage = parseInt(records_per_page);
      const skipDocuments = skipPage * limitPage;
      restaurantWaiters = await Waiter.find({ ...query })
        .populate('user_id')
        .populate('created_by')
        .skip(skipDocuments)
        .limit(limitPage)
        .sort(sortByUser);
    } else {
      restaurantWaiters = await Waiter.find({ ...query })
        .populate('user_id')
        .sort(sortByUser);
    }
    let filteredWaiters = [];
    for (let waiter of restaurantWaiters) {
      const waiterVotes = await WaiterVoting.find({
        waiter_id: waiter._id,
      }).populate('user_id');
      const restaurant = await RestaurantUtil.getRestaurantByPlaceId(waiter.restaurant_id);
      filteredWaiters = [...filteredWaiters, { ...waiter._doc, restaurant, waiterVotes }];
    }
    return filteredWaiters;
  } catch (error) {
    logger.error(error);
    console.log(error);
    return {};
  }
};

// In this method we will build query to find waiters
exports.buildQuery = async (params) => {
  try {
    let query = {};
    if (params.status == constant.WAITER_PENDING) {
      query = {
        ...query,
        $or: [
          {
            status: constant.WAITER_PENDING,
          },
          {
            status: { $exists: false },
          },
        ],
      };
    }
    if (params.statuses) {
      query = {
        ...query,
        status: { $in: params.statuses },
      };
    }
    if (params.full_name) {
      let user, restaurantIds;
      if (params.search_by?.length) {
        if (params.search_by.includes(constant.USER)) {
          user = await User.find({
            full_name: { $regex: params.full_name.trim(), $options: 'i' },
            is_waiter: true,
          }).distinct('_id');
          query = {
            ...query,
            $or: [
              { full_name: { $regex: params.full_name.trim(), $options: 'i' } },
              { user_id: { $in: user } },
            ],
          };
        }
        if (params.search_by.includes(constant.RESTAURANT)) {
          restaurantIds = await Restaurant.find({
            name: { $regex: params.full_name.trim(), $options: 'i' },
          }).distinct('place_id');
          query = {
            ...query,
            restaurant_id: { $in: restaurantIds },
          };
        }
      } else {
        user = await User.find({
          full_name: { $regex: params.full_name.trim(), $options: 'i' },
          is_waiter: true,
        }).distinct('_id');
        restaurantIds = await Restaurant.find({
          name: { $regex: params.full_name.trim(), $options: 'i' },
        }).distinct('place_id');
        query = {
          ...query,
          $or: [
            { full_name: { $regex: params.full_name.trim(), $options: 'i' } },
            { user_id: { $in: user } },
            { restaurant_id: { $in: restaurantIds } },
          ],
        };
      }
    }
    if (params.full_name && params.status == constant.WAITER_PENDING) {
      let user, restaurantIds;
      const { $or, ...newQuery } = query;
      if (params.search_by?.length) {
        if (params.search_by.includes(constant.USER)) {
          user = await User.find({
            full_name: { $regex: params.full_name.trim(), $options: 'i' },
            is_waiter: true,
          }).distinct('_id');
          query = {
            ...newQuery,
            $and: [
              {
                $or: [
                  { full_name: { $regex: params.full_name.trim(), $options: 'i' } },
                  { user_id: { $in: user } },
                ],
              },
              {
                $or: [
                  {
                    status: constant.WAITER_PENDING,
                  },
                  {
                    status: { $exists: false },
                  },
                ],
              },
            ],
          };
        }
        if (params.search_by.includes(constant.RESTAURANT)) {
          restaurantIds = await Restaurant.find({
            name: { $regex: params.full_name.trim(), $options: 'i' },
          }).distinct('place_id');
          query = {
            ...newQuery,
            $and: [
              { restaurant_id: { $in: restaurantIds } },
              {
                $or: [
                  {
                    status: constant.WAITER_PENDING,
                  },
                  {
                    status: { $exists: false },
                  },
                ],
              },
            ],
          };
        }
      } else {
        user = await User.find({
          full_name: { $regex: params.full_name.trim(), $options: 'i' },
          is_waiter: true,
        }).distinct('_id');
        restaurantIds = await Restaurant.find({
          name: { $regex: params.full_name.trim(), $options: 'i' },
        }).distinct('place_id');
        query = {
          ...newQuery,
          $and: [
            {
              $or: [
                { full_name: { $regex: params.full_name.trim(), $options: 'i' } },
                { user_id: { $in: user } },
                { restaurant_id: { $in: restaurantIds } },
              ],
            },
            {
              $or: [
                {
                  status: constant.WAITER_PENDING,
                },
                {
                  status: { $exists: false },
                },
              ],
            },
          ],
        };
      }
    }
    if (params.restaurant_id) {
      query = {
        ...query,
        restaurant_id: params.restaurant_id,
      };
    }
    return query;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
  }
};

exports.populateWaiter = async (waiter_id) => {
  try {
    logger.info('Populating waiter details');
    let waiter = await Waiter.findById(waiter_id);
    waiter._doc.restaurant = await RestaurantUtil.getRestaurantByPlaceId(waiter.restaurant_id);
    return waiter;
  } catch (error) {
    console.log(error);
    logger.error(JSON.stringify((error = error.stack)));
  }
};

exports.populateWaitersDetail = async (waiters) => {
  try {
    let waitersDetails = [];
    for (const waiter of waiters) {
      const detail = await this.populateWaiter(waiter._id);
      waitersDetails = [...waitersDetails, detail];
    }
    return waitersDetails;
  } catch (error) {
    console.log(error);
    logger.error(JSON.stringify((error = error.stack)));
  }
};

exports.getUserWaiterRating = async (user_id) => {
  try {
    const waitersRating = await Waiter.find({ user_id }).distinct('rating');
    const totalRate = waitersRating.reduce((acc, item) => Number(item) + acc, 0);
    return totalRate / waitersRating.length;
  } catch (error) {
    console.log(error);
    logger.error(JSON.stringify((error = error.stack)));
  }
};
