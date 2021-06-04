const Joi = require('@hapi/joi');
const appRoot = require('app-root-path');
const constant = require(appRoot + '/src/constant');

exports.validateCreateWaiterJobForm = Joi.object({
  id: Joi.string().required(),
  full_name: Joi.string().required(),
  last_name: Joi.string().optional().allow(''),
  education: Joi.string().optional().allow(''),
  time: Joi.string().valid(constant.WAITER_TIME[0], constant.WAITER_TIME[1]).optional(),
  position: Joi.string().optional().allow(''),
  experience: Joi.array()
    .items(
      Joi.object({
        enterprise_name: Joi.string().required(),
        restaurant_id: Joi.string().required(),
        position: Joi.string().required(),
        still_working: Joi.boolean().required(),
        start_date: Joi.string().optional().allow(''),
        end_date: Joi.string().optional().allow(''),
      }),
    )
    .optional(),
  telephone_number: Joi.string().optional().allow(''),
  diploma: Joi.string().optional().allow(''),
  availability: Joi.array()
    .items(
      Joi.object({
        day: Joi.string().optional(),
        slot: Joi.array()
          .items(
            constant.WAITER_JOB_SHIFTS[0],
            constant.WAITER_JOB_SHIFTS[1],
            constant.WAITER_JOB_SHIFTS[2],
          )
          .required(),
      }).optional(),
    )
    .when('time', {
      is: constant.WAITER_TIME[0],
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
});

exports.validateGetWaiterJobForm = Joi.object({
  user_id: Joi.string().optional().allow(''),
  page_no: Joi.number().optional(),
  records_per_page: Joi.number().optional(),
  search: Joi.string().optional().allow(''),
  position: Joi.string().optional().allow(''),
  time: Joi.array().optional(),
  experience_greater: Joi.string().optional().allow(''),
  experience_less: Joi.string().optional().allow(''),
  rating_needed: Joi.boolean().optional(),
  form_id: Joi.string().optional().allow(''),
  rating: Joi.number().optional().allow(''),
  first_item: Joi.string().optional().allow(''),
  manager_id: Joi.string().optional().allow(''),
  filtered_list: Joi.string().optional().allow(''),
});

exports.validateUpdateListWaiterJobForm = Joi.object({
  form_id: Joi.string().required(),
});

exports.validateDeleteWaiterJobForm = Joi.object({
  ids: Joi.array().required(),
});
