const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const waitersJobFormValidation = require('./waiters-job-form.validation');
const WaitersJobForm = require(appRoot + '/src/model/waiter-job-form');
const pagination = require(appRoot + '/src/util/pagination');
const JobFormsUtil = require('./util/job-form.util');
const { isFrench } = require(appRoot + '/src/util');
const JobFormRemoval = require(appRoot + '/src/model/job-form-removals');
const emailUtil = require(appRoot + '/src/util/email-util/send-email.js');
const constant = require(appRoot + '/src/constant');
const User = require(appRoot + '/src/model/user');
const { getExperienceTotal } = require(appRoot + '/src/util/total-experience');
exports.createWaiterJobForm = async (req, res) => {
  try {
    logger.info('In waiters-job-form - Validating [createWaiterJobForm]');
    const id = req.params.id;
    const { error } = waitersJobFormValidation.validateCreateWaiterJobForm.validate(
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
    logger.info(`creating waiter form in [createWaiterJobForm]`);
    const {
      full_name,
      last_name,
      experience,
      last_experience,
      education,
      time,
      position,
      availability,
      telephone_number,
      diploma,
    } = req.body;
    let queryToUpdate = {
      full_name,
      last_name,
      experience,
      last_experience,
      education,
      time,
      position,
      availability,
      telephone_number,
      diploma,
    };
    const updateWaiterJobForm = await WaitersJobForm.findOne({ user_id: id }).sort({
      createdAt: -1,
    });
    queryToUpdate.experience_count = getExperienceTotal(experience);
    if (updateWaiterJobForm) {
      await WaitersJobForm.findByIdAndUpdate(updateWaiterJobForm._id, queryToUpdate);
      const updatedForm = await WaitersJobForm.findById(updateWaiterJobForm._id);

      return res.status(200).json({
        message: 'Waiter form successfully updated!',
        data: updatedForm,
      });
    }
    queryToUpdate.user_id = id;
    const waiterForm = await WaitersJobForm.create(queryToUpdate);
    const user = await User.findById(id);
    logger.info(`successfully created waiter form in [createWaiterJobForm]`);
    logger.info(`sending email of creating profile in [createWaiterJobForm]`);
    await emailUtil.send({
      to: user.email,
      from: constant.EMAIL_FROM,
      name: 'Pourboir',
      templateId: isFrench(user.lang)
        ? constant.TEMPLATE_WAITER_JOB_FORM_FILLED_FRA
        : constant.TEMPLATE_WAITER_JOB_FORM_FILLED,
      placeholders: {
        userName: user.full_name,
      },
    });
    return res.status(200).json({
      message: 'Waiter form successfully created!',
      data: waiterForm,
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

exports.getWaitersJobForms = async (req, res) => {
  try {
    logger.info('In waiters-job-form - Validating [getWaitersJobForms]');
    const { error } = waitersJobFormValidation.validateGetWaiterJobForm.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    logger.info(`getting waiter forms in [getWaitersJobForms]`);

    const query = await JobFormsUtil.buildQuery(req.query);
    const { data, count } = await pagination.paginateData(WaitersJobForm, query, req.query);

    let custom_data = [];
    custom_data = await JobFormsUtil.populateData(data, req.query);
    logger.info(`successfully get waiter forms in [getWaitersJobForms]`);
    return res.status(200).json({
      message: 'Waiters job forms data has been found successfully.',
      total_number_of_forms: count,
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

exports.updateFormListForManager = async (req, res) => {
  try {
    logger.info('In waiters-job-form - Validating [updateFormListForManager]');
    const { error } = waitersJobFormValidation.validateUpdateListWaiterJobForm.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    logger.info(`updating waiter forms list in [updateFormListForManager]`);
    const form = await WaitersJobForm.findById(req.body.form_id);
    const query = {
      manager_id: req.user.id,
      form_id: req.body.form_id,
      form_updatedAt: form.updatedAt,
    };
    const isJob = await JobFormRemoval.findOne(query);
    if (isJob) {
      return res.status(400).json({
        message: 'Manager has already removed this form!',
      });
    }
    await JobFormRemoval.create(query);
    logger.info(`successfully updated waiter forms in [updateFormListForManager]`);
    return res.status(200).json({
      message: 'Waiters job forms list has been found successfully for manager.',
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

exports.deleteWaitersJobForms = async (req, res) => {
  try {
    logger.info('In waiters-job-form - Validating [deleteWaitersJobForms]');
    const { ids } = req.body;
    const { error } = waitersJobFormValidation.validateDeleteWaiterJobForm.validate(
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
    logger.info(`deleting waiter forms list in [deleteWaitersJobForms]`);
    await WaitersJobForm.deleteMany({ _id: { $in: ids } });
    logger.info(`successfully deleted waiter forms in [deleteWaitersJobForms]`);
    return res.status(200).json({
      message: 'Waiters job forms list has been found deleted.',
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
