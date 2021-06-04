const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const waitersVotingValidation = require('./waiters-voting.validation');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const waiterVotingUtil = require('./util/waiter-voting-util');
const pagination = require(appRoot + '/src/util/pagination');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const User = require(appRoot + '/src/model/user');
const Waiter = require(appRoot + '/src/model/waiter');
const emailUtil = require(appRoot + '/src/util/email-util/send-email.js');
const constant = require(appRoot + '/src/constant');
const _get = require('lodash/get');
const { isFrench } = require('../../../util');

exports.addRestaurantWaiterRating = async (req, res) => {
  try {
    logger.info('In waiters-voting - Validating add waiters-voting [addRestaurantWaiterRating]');
    const { error } = waitersVotingValidation.validateWaitersVotingAdd.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const { user_id, restaurant_id, waiter_id } = req.body;
    const { isVoted, vote } = await waiterVotingUtil.addWaiterVote(req);
    if (isVoted) {
      logger.info(`[starting] sending email to user for giving tip to waiter ${user_id}`);
      const restaurant = await Restaurant.findOne({ place_id: restaurant_id });
      const userDetails = await User.findById(user_id).select('email lang');
      const waiter = await Waiter.findById(waiter_id).populate('user_id');
      await emailUtil.send({
        to: userDetails.email,
        from: constant.EMAIL_FROM,
        name: 'Pourboir',
        templateId: isFrench(userDetails.lang)
          ? constant.TEMPLATE_USER_TIP_FRA
          : constant.TEMPLATE_USER_TIP,
        placeholders: {
          waiterName: waiter.full_name || _get(waiter, 'user_id.full_name', ''),
          ticketNumber: vote.token,
          restaurantName: restaurant.name,
        },
      });
      logger.info(`[ending] sending email to user email ${userDetails.email}`);
      return res.status(200).json({
        message: 'Waiter voting is successfully added',
        data: vote,
      });
    }
    res.status(400).json({
      message: 'Already voted today',
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

exports.getWaitersVotes = async (req, res) => {
  try {
    logger.info('In waiters-voting - Validating get waiters-voting [getWaitersVotes]');
    const { error } = waitersVotingValidation.validateGetWaitersVoting.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const query = await waiterVotingUtil.buildQuery(req.query);
    const { data, count } = await pagination.paginateData(WaiterVoting, query, req.query, {
      restaurant_id: true,
    });
    let enhancedDetails = data;
    if (!(req.query.no_extra_data === 'true')) {
      enhancedDetails = await waiterVotingUtil.populateRestaurantData(data);
    }
    return res.status(200).json({
      message: 'Waiter votes data has been found successfully.',
      total_number_of_votes: count,
      page_no: req.query.page_no,
      records_per_page: req.query.records_per_page,
      data: enhancedDetails,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.deleteWaiterVote = async (req, res) => {
  try {
    logger.info('In waiters-voting - Validating delete waiters-voting [deleteWaiterVote]');
    const id = req.params.id;
    const { error } = waitersVotingValidation.validateDeleteWaitersVoting.validate(
      { ...req.body, id },
      {
        abortEarly: false,
      },
    );
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const vote = await WaiterVoting.findById(id);
    if (!vote) {
      logger.info(`no waiter vote with this id ${id}`);
      return res.status(400).json({
        message: `Invalid Request. No vote found with id ${id}.`,
      });
    }
    await WaiterVoting.deleteOne({ _id: id });
    return res.status(200).json({
      message: 'waiter votes successfully deleted.',
    });
  } catch (error) {}
};
