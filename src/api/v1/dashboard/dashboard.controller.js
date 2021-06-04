const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const constant = require(appRoot + '/src/constant');
const dashboardValidation = require('./dashboard.validation');
const User = require(appRoot + '/src/model/user');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const Waiter = require(appRoot + '/src/model/waiter');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const Utils = require(appRoot + '/src/util');
const moment = require('moment');
const dashboardUtil = require('./util/dashboard.util');
const dashboardCommonUtils = require('./util/dashboard.common.utils');
const { populateWaitersDetail } = require('../waiters/util/waiters.util');

exports.getTotalCounts = async (req, res) => {
  try {
    logger.info('In dashboard - Validating [getTotalCounts] dashboard');
    const { error } = dashboardValidation.validateGetTotalCounts.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    logger.info('All validations passed');
    let startDate, date, endDate;
    if (req.query.start_date && req.query.end_date) {
      startDate = moment(req.query.start_date, 'YYYY-MM-DD').toDate();
      date = startDate;
      const finishDate = moment(req.query.end_date, 'YYYY-MM-DD');
      endDate = moment(finishDate).add(1, 'days').toDate();
    } else {
      date = new Date(Date.now());
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }
    const total_number_of_users = await User.countDocuments({});
    const total_restaurants = await Restaurant.countDocuments({});
    const total_waiters = await Waiter.countDocuments({});
    const total_reviews = await WaiterVoting.countDocuments({});
    const total_pending_waiters = await Waiter.countDocuments({
      $or: [
        {
          status: constant.WAITER_PENDING,
        },
        {
          status: { $exists: false },
        },
      ],
    });
    const total_archived_waiters = await Waiter.countDocuments({
      status: constant.WAITER_ARCHIVED,
    });
    const total_active_waiters = await Waiter.countDocuments({
      status: constant.WAITER_ACTIVE,
    });
    const total_android_users = await User.countDocuments({ os: constant.ANDROID });
    const total_apple_users = await User.countDocuments({ os: constant.APPLE });
    const restaurants_with_menu_url = await Restaurant.countDocuments({
      $and: [
        {
          menu_url: { $ne: '' },
        },
        {
          menu_url: { $exists: true },
        },
      ],
    });
    const best_waiters = await Waiter.countDocuments({
      rating: { $gte: 4 },
      status: constant.WAITER_ACTIVE,
    });
    const best_restaurants = await Restaurant.countDocuments({ our_rating: { $gte: 4 } });
    const query = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: constant.WAITER_ACTIVE,
    };
    const last_month_users = await User.countDocuments(query);
    const last_month_restaurants = await Restaurant.countDocuments(query);
    const last_month_waiters = await Waiter.countDocuments(query);
    const last_month_reviews = await WaiterVoting.countDocuments(query);

    let bestWaitersOfMonth = await Waiter.find({
      rating: { $gte: 4 },
      status: constant.WAITER_ACTIVE,
    })
      .populate('user_id')
      .populate('place_id')
      .sort({ rating: -1 })
      .limit(3);
    bestWaitersOfMonth = await populateWaitersDetail(bestWaitersOfMonth);
    const bestRestaurantOfMonth = await Restaurant.find({ our_rating: { $gte: 4 } })
      .sort({ our_rating: -1 })
      .limit(3);
    // const dailyUserDataChartAndroid = await dashboardUtil.UserStatsCharts(startDate, endDate, 'android');
    // const dailyUserDataChartIos = await dashboardUtil.UserStatsCharts(startDate, endDate, 'apple');
    const datesArray = dashboardCommonUtils.getPrevMonth();
    const dashboardAppleChart = await dashboardUtil.monthCountOfOs(datesArray, 'apple');
    const dashboardAndroidChart = await dashboardUtil.monthCountOfOs(datesArray, 'android');

    return res.status(200).json({
      message: 'Dashboard data found',
      startDate,
      endDate,
      users: {
        total_number_of_users,
        last_month_users,
        users_percentage: Utils.percentage(last_month_users, total_number_of_users),
        total_android_users,
        total_apple_users,
      },
      waiters: {
        total_waiters,
        last_month_waiters,
        waiters_percentage: Utils.percentage(last_month_waiters, total_waiters),
        total_pending_waiters,
        best_waiters,
        bestWaitersOfMonth,
        total_archived_waiters,
        total_active_waiters,
      },
      restaurant: {
        total_restaurants,
        last_month_restaurants,
        restaurants_percentage: Utils.percentage(last_month_restaurants, total_restaurants),
        restaurants_with_menu_url,
        best_restaurants,
        bestRestaurantOfMonth,
      },
      reviews: {
        total_reviews,
        last_month_reviews,
        reviews_percentage: Utils.percentage(last_month_reviews, total_reviews),
      },
      charts: {
        dashboardAndroidChart,
        dashboardAppleChart,
      },
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    console.log(error);
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
