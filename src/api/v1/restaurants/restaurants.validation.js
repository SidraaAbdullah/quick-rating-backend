const Joi = require('@hapi/joi');

exports.validateGetRestaurantsData = Joi.object({
  location: Joi.any().optional(),
  language: Joi.number().optional(),
  pagetoken: Joi.string().optional(),
  search: Joi.string().optional().allow(''),
  category: Joi.string().optional().allow(''),
});

exports.validateGetWaiterRestaurantsData = Joi.object({
  id: Joi.string().required(),
  location: Joi.string().optional(),
  page_no: Joi.string().optional(),
  max_results: Joi.string().optional(),
});

exports.validateSearchRestaurantsData = Joi.object({
  id: Joi.string().required(),
  language: Joi.number().optional(),
});

exports.validateSavedGetRestaurants = Joi.object({
  name: Joi.string().optional(),
  page_no: Joi.string().optional(),
  records_per_page: Joi.string().optional(),
  sort_by: Joi.string().optional(),
  order: Joi.number().optional(),
  restaurant_id: Joi.string().optional(),
});

exports.validateUpdateRestaurants = Joi.object({
  id: Joi.string().required(),
  menu_url: Joi.string().optional().allow(''),
  formatted_address: Joi.string().optional().allow(''),
  name: Joi.string().optional().allow(''),
  rating: Joi.number().optional().allow(''),
  photos: Joi.array().optional(),
  our_rating: Joi.string().optional().allow(''),
  location: Joi.string().optional().allow(''),
  international_phone_number: Joi.string().optional().allow(''),
});

exports.validateRestaurantDetails = Joi.object({
  id: Joi.string().required(),
});
