const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const constant = require(appRoot + '/src/constant');
const User = require(appRoot + '/src/model/user');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const Waiter = require(appRoot + '/src/model/waiter');
const RestaurantUtil = require(appRoot +
  '/src/api/v1/restaurants/util/restaurants.util');
const dashboardCommonUtil = require('./dashboard.common.utils')
const moment = require('moment')
// In this method we will get users against query


exports.UserStatsCharts = async (startDate, endDate, os) => {
  try {
    logger.info('In dashboard - [UserStatsCharts]');
    const dates = await dashboardCommonUtil.dateRange(startDate, endDate);
    let userGraphData = [];
    const getNetIncome = dates.map(async (date) => {
      const finishDate = moment(date).add(1, 'days').toDate();
      const netIncome = await this.calculateNetUser(date, finishDate, os);
      const formateDate = await dashboardCommonUtil.formatDate(date);
      const netIncomeGraph = {}
      netIncomeGraph.x = formateDate;
      netIncomeGraph.y = netIncome;
      return netIncomeGraph;
    });
    userGraphData = await Promise.all(getNetIncome);
    return userGraphData;
  } catch (error) {
    console.log(error)
    logger.error(JSON.stringify((error = error.stack)));
  }
}

exports.calculateNetUser = async (startDate, endDate, os) => {
  try {
    const query = {
      createdAt: { $gte: startDate, $lte: endDate },
      os
    }
    const userFind = await User.countDocuments(query)
    logger.info(`return total ${os} users from  ${startDate} to ${endDate}`);
    return userFind;
  } catch (error) {
    console.log(error)
    logger.error(JSON.stringify(error = error.stack));
    return 0;
  }
}

exports.monthCountOfOs = async (dataArray, os) => {
  try {
    const data = await Promise.all(dataArray.map(async item => {
      const query = {
        createdAt: { $gte: item.startDate, $lte: item.endDate },
        os
      }
      const count = await User.countDocuments(query);
      return {
        x: item.month,
        y: count
      }
    }))
    return data;
  } catch (error) {
    console.log(error)
    logger.error(JSON.stringify(error = error.stack));
    return null;
  }

}