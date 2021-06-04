const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const staffValidation = require('./staff.validation');
const Staff = require(appRoot + '/src/model/staff');
const pagination = require(appRoot + '/src/util/pagination');
const staffUtil = require('./util/staff.util');

exports.createStaff = async (req, res) => {
  try {
    logger.info('In staff - Validating [createStaff]');
    const { error } = staffValidation.validateCreateStaff.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    logger.info(`creating staff form in [createStaff]`);
    const { full_name, email, type, manager_id } = req.body;
    const isStaff = await Staff.findOne({ email, type });
    if (isStaff) {
      return res.status(400).json({
        message: 'This staff is already registered!',
      });
    }
    const staff = await Staff.create({
      full_name,
      email,
      type,
      manager_id,
    });
    logger.info(`successfully created staff in [createStaff]`);
    return res.status(200).json({
      message: 'Staff is successfully created!',
      data: staff,
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

exports.getStaffs = async (req, res) => {
  try {
    logger.info('In staff - Validating [getStaffs]');
    const { error } = staffValidation.validateGetStaffs.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    logger.info(`getting staffs in [getStaffs]`);

    const query = await staffUtil.buildQuery(req.query, req.user);
    const { data, count } = await pagination.paginateData(Staff, query, req.query);

    let custom_data = data;

    logger.info(`successfully get staffs in [getStaffs]`);
    return res.status(200).json({
      message: 'Staffs data has been found successfully.',
      total_number_of_staffs: count,
      page_no: req.query.page_no,
      records_per_page: req.query.records_per_page,
      data: custom_data,
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
