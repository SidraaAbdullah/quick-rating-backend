const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const waitersValidation = require('./waiters.validation');
const Waiter = require(appRoot + '/src/model/waiter');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const waitersUtil = require('./util/waiters.util');
const emailUtil = require(appRoot + '/src/util/email-util/send-email.js');
const templateEmailUtil = require(appRoot + '/src/util/email-util/email-template.js');
const constant = require(appRoot + '/src/constant');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const UserUtil = require(appRoot + '/src/api/v1/user/util/user.util');
const waiterUpdate = require('./util/waiter.update');
const User = require(appRoot + '/src/model/user');

exports.getRestaurantWaiters = async (req, res) => {
  try {
    logger.info('In waiters - Validating get waiters');
    const { error } = waitersValidation.validateGetWaiters.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const query = await waitersUtil.buildQuery(req.query);
    logger.info(`getting all waiters`);
    let sortByUser = { createdAt: -1 };
    if (req.query.sort_by && req.query.order) {
      sortByUser = { [req.query.sort_by]: req.query.order };
    }
    let waiters = await waitersUtil.getWaitersToRestaurant({
      page_no: req.query.page_no,
      records_per_page: req.query.records_per_page,
      sortByUser,
      query,
    });
    let countWaiters = await Waiter.countDocuments({ ...query });

    return res.status(200).json({
      message: 'Waiters data has been found successfully.',
      total_number_of_waiters: countWaiters,
      page_no: req.query.page_no,
      records_per_page: req.query.records_per_page,
      data: waiters,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.addRestaurantWaiters = async (req, res) => {
  try {
    logger.info('In waiters - Validating add Waiter');
    const { error } = waitersValidation.validateAddWaiter.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const {
      restaurant,
      full_name,
      created_by,
      company_name,
      business_registration_number,
      manager_name,
      manager_contact,
      email,
    } = req.body;
    logger.info(`creating Waiter of restaurant: ${JSON.stringify(restaurant)}`);
    const userDetails = {
      company_name,
      business_registration_number,
      manager_name,
      manager_contact,
      full_name,
      email,
    };
    const waiterRestaurant = await UserUtil.addWaiterAndRestaurant({
      created_by,
      restaurant,
      ...userDetails,
    });
    logger.info(`Waiter created of restaurant, now sending email to Quick Rating Company`);
    const template = await templateEmailUtil.emailTemplate(restaurant, userDetails);
    await emailUtil.send({
      to: constant.EMAIL_TO,
      from: constant.EMAIL_FROM,
      name: 'Quick Rating',
      subject: `Waiter: ${full_name}`,
      html: template,
    });
    logger.info(`email successfully sent to Quick Rating Company`);
    if (email) {
      logger.info(`[starting] sending email to user email ${email}`);
      const template = await templateEmailUtil.waiterAddEmailTemplate(restaurant, userDetails);
      await emailUtil.send({
        to: email,
        from: constant.EMAIL_FROM,
        name: 'Quick Rating',
        subject: `Welcome to Quick Rating!`,
        html: template,
      });
      logger.info(`[ending] sending email to user email ${email}`);
    }
    await logger.info(`successfully created Waiter of restaurant: ${restaurant.place_id}`);
    return res.status(200).json({
      message: 'Waiter is successfully created',
      data: waiterRestaurant,
    });
  } catch (e) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.deleteRestaurantWaiter = async (req, res) => {
  try {
    logger.info('In restaurant waiters - Validating delete Waiter');
    const id = req.params.id;
    const { error } = waitersValidation.validateDeleteWaiter.validate(
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
    const { user_id = '' } = req.body;
    logger.info(`finding waiter against id:${id} and user Id:${user_id}`);
    const waiterUpdated = await waiterUpdate.waiterDeleteAndUpdate(id, user_id);
    if (waiterUpdated.isDeleted) {
      return res.status(200).json({
        message: waiterUpdated.message,
      });
    }
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.waiterUpdate = async (req, res) => {
  try {
    logger.info('In restaurant waiters - Validating [waiterUpdate] Waiter');
    const id = req.params.id;
    const { error } = waitersValidation.validateUpdateWaiter.validate(
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
    if (!Object.keys(req.body).length) {
      return res.status(400).json({
        message: 'No query to execute for waiter',
      });
    }
    logger.info(`Query : ${JSON.stringify(req.body)}`);
    await waiterUpdate.waiterUpdates(req.body, res, id);
    const waiter = await Waiter.findById(id);
    return res.status(200).json({
      message: 'Waiter Updated',
      data: waiter,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.deleteBulkRestaurantWaiter = async (req, res) => {
  try {
    logger.info('In restaurant waiters - Validating [deleteBulkRestaurantWaiter] Waiter');
    const { error } = waitersValidation.validateBulkDeleteWaiter.validate(
      { ...req.body },
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
    for (const waiterDetail of req.body.waiter_ids) {
      await waiterUpdate.waiterDeleteAndUpdate(waiterDetail.waiter_id, waiterDetail.user_id);
    }
    return res.status(200).json({
      message: 'Successfully bulk deleted waiters',
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
