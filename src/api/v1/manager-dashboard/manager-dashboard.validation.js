const Joi = require('@hapi/joi');

exports.signup = Joi.object({
  full_name: Joi.string().required(),
  last_name: Joi.string().optional().allow(''),
  password: Joi.string().required(),
  email: Joi.string().required(),
  restaurant_id: Joi.string().required(),
  postal_code: Joi.string().optional(),
  restaurant_address: Joi.string().required(),
});

exports.signIn = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

exports.validateGetManagers = Joi.object({
  page_no: Joi.number().optional(),
  records_per_page: Joi.number().optional(),
  search: Joi.string().optional().allow(''),
});
