const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const moment = require('moment');
const constant = require(appRoot + '/src/constant/index');
const dateUtil = require(appRoot + '/src/util/date');
const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const Waiter = require(appRoot + '/src/model/waiter');
const User = require(appRoot + '/src/model/user');

exports.addWaiterVote = async (req) => {
  try {
    const {
      tip,
      rating: { hospitality, speed, service, professionalism },
      rating,
      user_id,
      restaurant_id,
      waiter_id,
      currency,
      place_id
    } = req.body;
    let overall_rating = (hospitality + speed + service + professionalism) / 4;
    overall_rating = Math.round(overall_rating * 2) / 2;
    // const findIsUserVoted = await WaiterVoting.findOne({
    //   user_id,
    //   restaurant_id,
    //   waiter_id,
    // }).sort({
    //   createdAt: -1,
    // });
    // if (!constant.CAN_VOTE_ALWAYS) {
    //   if (findIsUserVoted) {
    //     const createdDate = moment(findIsUserVoted.createdAt);
    //     const isToday = dateUtil.isToday(createdDate);
    //     if (isToday) {
    //       return { isVoted: false };
    //     }
    //   }
    // }
    const vote = await WaiterVoting.create({
      overall_rating,
      rating,
      tip,
      user_id,
      restaurant_id,
      waiter_id,
      currency,
      ...(place_id ? { place_id } : {})
    });
    await this.updateAndGetWaiterRating(waiter_id);
    await RestaurantUtil.updateAndGetRestaurantRating(restaurant_id)
    return { isVoted: true, vote };
  } catch (error) {
    console.log(error)
    logger.error(JSON.stringify((error = error.stack)));
    return null;
  }
};

exports.buildQuery = async (params) => {
  try {
    logger.info('building query for waiters voting [buildQuery]');
    let query = {};

    if (params.waiter_id) {
      query = {
        ...query,
        waiter_id: params.waiter_id,
      };
    }
    if (params.search) {
      let waiterIds;
      let userIds;
      if (params.search_by?.length) {
        if (params.search_by.includes(constant.WAITER)) {
          waiterIds = await Waiter.find({
            full_name: { $regex: params.search.trim(), $options: 'i' },
          }).distinct('_id');
          query = {
            ...query,
            waiter_id: { $in: waiterIds }
          }
        }
        if (params.search_by.includes(constant.USER)) {
          userIds = await User.find({
            full_name: { $regex: params.search.trim(), $options: 'i' },
          }).distinct('_id');
          query = {
            ...query,
            user_id: { $in: userIds }
          }
        }
      } else {
        waiterIds = await Waiter.find({
          full_name: { $regex: params.search.trim(), $options: 'i' },
        }).distinct('_id');
        userIds = await User.find({
          full_name: { $regex: params.search.trim(), $options: 'i' },
        }).distinct('_id');
        query = {
          ...query,
          $or: [
            { waiter_id: { $in: waiterIds } },
            { user_id: { $in: userIds } },
          ]
        }
      }

    }
    logger.info('ending building query for waiters voting [buildQuery]');
    return query;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return null;
  }
};

exports.updateAndGetWaiterRating = async (waiter) => {
  try {
    logger.info(
      `[starting] getting and updating waiter rating [updateAndGetWaiterRating] of waiter: ${JSON.stringify(
        waiter,
      )}`,
    );
    const waiter_id = waiter._id || waiter;
    const waiterVotes = await WaiterVoting.find({
      waiter_id,
    }).populate('user_id');
    let rating = 0;
    if (waiterVotes) {
      for (const wv of waiterVotes) {
        let { overall_rating } = wv;
        rating += Number(overall_rating);
      }
      if (rating) {
        rating = rating / waiterVotes.length;
      }
      await Waiter.updateOne(
        { _id: waiter_id },
        {
          rating,
        },
      );
    }
    logger.info(
      `[ending] getting and updating waiter rating [updateAndGetWaiterRating] with rating: ${rating}`,
    );
    return { waiterVotes, rating };
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return null;
  }
};

exports.populateRestaurantData = async (data) => {
  try {
    logger.info(`[starting] [populateRestaurantData] populating details again all restaurant`)
    let restaurants = []
    for (const restaurant of data) {
      const details = await this.populateRestaurantDetail(restaurant);
      restaurants = [...restaurants, details]
    }
    return restaurants;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return null;
  }
}

exports.populateRestaurantDetail = async (restaurant) => {
  try {
    logger.info(`[starting] [populateRestaurantDetail] populating details again restaurant: ${JSON.stringify(restaurant)}`)
    let details = { ...restaurant._doc };
    if (!restaurant._doc.place_id) {
      const restaurantDetail = await Restaurant.findOne({ place_id: restaurant.restaurant_id }).select('name');
      details = { ...details, place_id: restaurantDetail };
    }
    return details;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return null;
  }
}