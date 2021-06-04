const Joi = require('@hapi/joi');

exports.validateGetWaiters = Joi.object({
  restaurant_id: Joi.string().optional(),
  page_no: Joi.string().optional(),
  records_per_page: Joi.string().optional(),
  order: Joi.string().optional(),
  sort_by: Joi.string().optional(),
  statuses: Joi.array().optional(),
  status: Joi.string().optional(),
  full_name: Joi.string().optional().allow(''),
  search_by: Joi.array().optional(),
});

exports.validateAddWaiter = Joi.object({
  restaurant: Joi.object({
    place_id: Joi.string().required(),
    rating: Joi.number().optional(),
    photos: Joi.array().optional(),
    name: Joi.string().required(),
    formatted_address: Joi.string().required(),
    our_rating: Joi.string().optional().allow(''),
    location: Joi.object().optional().allow(null),
    international_phone_number: Joi.string().optional().allow(''),
  }).required(),
  full_name: Joi.string().required(),
  created_by: Joi.string().required(),
  company_name: Joi.string().optional(),
  business_registration_number: Joi.string().optional(),
  manager_name: Joi.string().optional(),
  manager_contact: Joi.string().optional(),
  email: Joi.string().optional(),
});

exports.validateDeleteWaiter = Joi.object({
  id: Joi.string().required(),
  user_id: Joi.string().optional(),
});

exports.validateUpdateWaiter = Joi.object({
  id: Joi.string().required(),
  status: Joi.string().optional(),
  user_id: Joi.string().optional(),
});

exports.validateBulkDeleteWaiter = Joi.object({
  waiter_ids: Joi.array()
    .items(
      Joi.object({
        user_id: Joi.string().optional(),
        waiter_id: Joi.string().required(),
      }),
    )
    .required(),
});
