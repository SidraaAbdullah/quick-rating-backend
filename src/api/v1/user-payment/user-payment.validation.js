const Joi = require('@hapi/joi');

exports.validateAddCard = Joi.object({
  token: Joi.string().required(),
  user_id: Joi.string().required(),
  last_4_card_no: Joi.string().required(),
});
