const Joi = require('@hapi/joi');

exports.validateGetTotalCounts = Joi.object({
  end_date: Joi.string().optional(),
  start_date: Joi.string().optional(),
});
