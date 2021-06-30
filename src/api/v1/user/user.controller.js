const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const userValidation = require('./user.validation');
const User = require(appRoot + '/src/model/user');
const userUtil = require('./util/user.util');
const Waiter = require(appRoot + '/src/model/waiter');
const UploadImage = require('./util/upload-image');
const Util = require(appRoot + '/src/util');
const _get = require('lodash/get');
const { isEng, isFrench } = require('../../../util');
const emailUtil = require(appRoot + '/src/util/email-util/send-email.js');
const constant = require(appRoot + '/src/constant');

exports.getUsers = async (req, res) => {
  try {
    logger.info('In Users - Validating users');
    const { error } = userValidation.validateGetUsersData.validate(req.query, {
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
    logger.info(`calling [buildQuery] to build query for users`);
    const userBuildQuery = await userUtil.buildQuery(req.query);
    const sortBy = Util.sortBy(req.query.sort_by, req.query.order);
    const users = await userUtil.getUsers(req.query, userBuildQuery, sortBy);
    logger.info(`${users.length} users exists of the requested platform`);
    const countUsers = await User.countDocuments(userBuildQuery);
    if (users.length) {
      logger.info('Returning back Users data with success code 200');
      return res.status(200).json({
        message: ' Users data has been found successfully.',
        total_number_of_users: countUsers,
        page_no: req.query.page_no,
        records_per_page: req.query.records_per_page,
        data: users,
      });
    } else {
      return res.status(404).json({
        message: `Sorry, we couldn't find any user for this platform.`,
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

exports.googleSignup = async (req, res) => {
  try {
    logger.info('In Users - Validating google users');
    const { error } = userValidation.validateGoogleSignup.validate(req.body, {
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
    logger.info(`body: ${JSON.stringify(req.body)}`);
    logger.info('Destructing req.body');
    const { id } = req.body;
    const isUser = await userUtil.isGoogleUserStored(id);
    if (!isUser.exists) {
      const user = await userUtil.addGoogleUserInDb(req.body);
      return res.status(200).json({
        message: `User created`,
        user,
      });
    } else {
      let oldUser = isUser.user;
      const updatedBody = {
        city: _get(req, 'body.city', ''),
        login_type: _get(req, 'body.login_type', ''),
        mobile_type: _get(req, 'body.mobile_type', ''),
        os: _get(req, 'body.os', ''),
        last_login_at: new Date(),
      };
      await User.updateOne({ _id: oldUser._id }, updatedBody);
      oldUser = { ...oldUser._doc, ...updatedBody };
      return res.status(200).json({
        message: `User Already exist`,
        user: oldUser,
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

exports.addUserToWaitersList = async (req, res) => {
  try {
    logger.info('In Add-Restaurant - Validating add-users API');
    const { error } = userValidation.validateAddUserToWaitersList.validate(req.body, {
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
      user_id,
      restaurant,
      company_name,
      business_registration_number,
      manager_name,
      manager_contact,
    } = req.body;
    const { place_id } = restaurant;
    logger.info(`Checking if user is already in the list of restaurant: ${place_id}`);
    const waiter = await Waiter.findOne({ user_id, restaurant_id: place_id });
    if (waiter) {
      logger.info(`You already exist in ${waiter.status} waiters list of this restaurant`);
      return res.status(400).json({
        message: `You already exist in ${waiter.status} waiters list of this restaurant`,
      });
    }
    logger.info(`adding user to waiters list of restaurant: ${place_id}`);
    const waiterRestaurant = await userUtil.addWaiterAndRestaurant({
      user_id,
      restaurant,
      company_name,
      business_registration_number,
      manager_name,
      manager_contact,
    });
    const user = await User.findById(user_id).select('email lang');
    await emailUtil.send({
      to: user.email,
      from: constant.EMAIL_FROM,
      name: 'Quick Rating',
      templateId: isFrench(user.lang)
        ? constant.TEMPLATE_WAITER_PENDING_APPROVAL_FRA
        : constant.TEMPLATE_WAITER_PENDING_APPROVAL,
      placeholders: {
        restaurantName: restaurant.name,
      },
    });
    return res.status(200).json({
      message: 'User is successfully added in waiters list',
      data: waiterRestaurant,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.changeUserDisplay = async (req, res) => {
  try {
    const id = req.params.id;
    logger.info('In users - Validating [changeUserDisplay] API');
    const { error } = userValidation.validateChangeUserDisplay.validate(
      { id },
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
    const user = User.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        message: `No user found of id:${id}`,
      });
    }
    await UploadImage.uploadImageToS3(req, res);
    return;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    logger.info('In users [getUserById] - Validating API');
    const { error } = userValidation.validateChangeUserDisplay.validate(
      { id },
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
    const user = await User.findById(id);
    const details = await userUtil.getUserDetail(id, user);
    return res.status(200).json({
      message: 'User detail has been found',
      data: details,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.patchUpdateUser = async (req, res) => {
  try {
    const id = req.params.id;
    logger.info('In users [getUserById] - Validating API');
    const { error } = userValidation.validatePatchUserUpdate.validate(
      { id },
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
    if (Object.keys(req.body).length) {
      const query = await userUtil.patchUpdateQuery(req.body);
      await User.updateOne({ _id: id }, query);
      logger.info('In user, User successfully updated');
      return res.status(200).json({
        message: 'User successfully updated',
      });
    }
    return res.status(400).json({
      message: 'Nothing to update',
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
