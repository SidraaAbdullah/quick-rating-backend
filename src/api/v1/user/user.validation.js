const Joi = require('@hapi/joi');

exports.validateGetUsersData = Joi.object({
  page_no: Joi.number().optional(),
  records_per_page: Joi.number().optional(),
  sort_by: Joi.string().optional(),
  order: Joi.number().optional(),
  is_all_data: Joi.boolean().optional(),
  full_name: Joi.string().optional().allow(''),
});

exports.validateGoogleSignup = Joi.object({
  email: Joi.string().optional().allow(''),
  family_name: Joi.string().optional().allow(''),
  given_name: Joi.string().optional().allow(''),
  name: Joi.string().optional().allow(''),
  id: Joi.string().required(),
  locale: Joi.string().optional(),
  picture: Joi.string().optional().allow(''),
  verified_email: Joi.string().optional().allow(''),
  login_type: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  mobile_type: Joi.string().optional().allow(''),
  os: Joi.string().optional().allow(''),
});

exports.validateAddUserToWaitersList = Joi.object({
  user_id: Joi.string().required(),
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
  company_name: Joi.string().optional(),
  business_registration_number: Joi.string().optional(),
  manager_name: Joi.string().optional(),
  manager_contact: Joi.string().optional(),
});

exports.validateChangeUserDisplay = Joi.object({
  id: Joi.string().required(),
});

exports.validateGetUserById = Joi.object({
  id: Joi.string().required(),
});

exports.validatePatchUserUpdate = Joi.object({
  id: Joi.string().required(),
  first_name: Joi.string().optional(),
  last_name: Joi.string().optional(),
  phone_number: Joi.string().optional(),
  email: Joi.string().optional(),
  expo_notification_token: Joi.string().optional().allow(''),
  lang: Joi.string().optional().allow(''),
});

exports.validateAddCard = Joi.object({
  id: Joi.string().required(),
  token: Joi.string().required(),
});
