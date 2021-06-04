const Joi = require('@hapi/joi');

exports.validateWaitersVotingAdd = Joi.object({
  rating: Joi.object({
    hospitality: Joi.number().integer().min(0).max(5).required(),
    speed: Joi.number().integer().min(0).max(5).required(),
    service: Joi.number().integer().min(0).max(5).required(),
    professionalism: Joi.number().integer().min(0).max(5).required(),
  }).required(),
  tip: Joi.string().required(),
  user_id: Joi.string().required(),
  restaurant_id: Joi.string().required(),
  waiter_id: Joi.string().required(),
  currency: Joi.string().required(),
  place_id: Joi.string().optional().allow(''),
});

exports.validateGetWaitersVoting = Joi.object({
  waiter_id: Joi.string().optional(),
  page_no: Joi.string().optional(),
  records_per_page: Joi.string().optional(),
  order: Joi.string().optional(),
  sort_by: Joi.string().optional(),
  search: Joi.string().optional(),
  search_by: Joi.array().optional(),
  no_extra_data: Joi.array().optional(),
});

exports.validateDeleteWaitersVoting = Joi.object({
  id: Joi.string().required(),
});