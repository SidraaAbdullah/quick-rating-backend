const Joi = require('@hapi/joi');
const appRoot = require('app-root-path');
const constant = require(appRoot + '/src/constant');

exports.validateCreateStaff = Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().required(),
  type: Joi.string().valid(constant.STAFFS[0], constant.STAFFS[1]).optional(),
  manager_id: Joi.string().required(),
});

exports.validateGetStaffs = Joi.object({
  page_no: Joi.number().optional(),
  records_per_page: Joi.number().optional(),
  search: Joi.string().optional().allow(''),
  type: Joi.array().items(Joi.string().valid(constant.STAFFS[0], constant.STAFFS[1])).optional(),
});
