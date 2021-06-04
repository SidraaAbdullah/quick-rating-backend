const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const managerValidation = require('./manager-dashboard.validation');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Manager = require(appRoot + '/src/model/manager');
const config = require('config');
const pagination = require(appRoot + '/src/util/pagination');
const managerUtil = require('./util/manager-dashboard.util');
exports.signIn = async (req, res) => {
  try {
    logger.info('In restaurant waiters - Validating delete Waiter');

    const { error } = managerValidation.signIn.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    Manager.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).json({ message: 'Error on the server.' });
      if (!user) return res.status(404).json({ message: 'No user found.' });

      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid)
        return res.status(401).json({ auth: false, token: null, message: 'Wrong Password' });

      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400, // expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token, data: user });
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.signUp = async (req, res) => {
  try {
    logger.info('In restaurant waiters - Validating delete Waiter');

    const { error } = managerValidation.signup.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const checkManager = await Manager.findOne({ email: req.body.email });
    if (checkManager) {
      return res.status(400).json({
        message: 'You are already registered!',
      });
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    await Manager.create({
      full_name: req.body.full_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: hashedPassword,
      restaurant_id: [req.body.restaurant_id],
      restaurant_address: req.body.restaurant_address,
      postal_code: req.body.postal_code,
    });
    res.status(200).json({
      message: 'Manager successfully created!',
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.getAllManagers = async (req, res) => {
  try {
    logger.info('In restaurant waiters - Validating get all managers');

    const { error } = managerValidation.validateGetManagers.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    logger.info(`getting managers forms in [getAllManagers]`);
    const query = await managerUtil.buildQuery(req.query);
    const { data, count } = await pagination.paginateData(Manager, query, req.query);
    return res.status(200).json({
      message: 'Waiters job forms data has been found successfully.',
      total_number_of_forms: count,
      page_no: req.query.page_no,
      records_per_page: req.query.records_per_page,
      data: data,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
