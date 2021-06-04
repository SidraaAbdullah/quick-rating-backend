const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const userPaymentValidation = require('./user-payment.validation');
const User = require(appRoot + '/src/model/user');
const Util = require(appRoot + '/src/util');
const _get = require('lodash/get');
const stripeUtility = require(appRoot + '/src/util/stripe-util');
const createCustomerPayment = stripeUtility.createCustomerWithPaymentMethod();
const getCard = stripeUtility.retrieveCardDetails();
const UserPayMethods = require(appRoot + '/src/model/user-payment-methods');
const UserPaymentUtil = require('./util/user-payment.util');

exports.addCustomerCard = async (req, res) => {
  try {
    logger.info('staring [addCustomerCard]');
    const { token, user_id, last_4_card_no } = req.body;
    logger.info('In users [getUserById] - Validating API');
    const { error } = userPaymentValidation.validateAddCard.validate(
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
    const user = await User.findById(user_id);
    const paymentDetails = await UserPayMethods.findOne({ user_id: user._id, last_4_card_no });
    if (paymentDetails) {
      logger.info(`This card already exist in user details`);
      return res.status(400).json({
        message: 'This card already exist in user payment details.',
      });
    }
    const details = await createCustomerPayment.createCustomerWithPaymentMethod(
      token,
      user.customer_id,
      user,
    );
    if (details) {
      const { customer, paymentMethod } = details;
      const card = await getCard.retrieveCardDetails(customer, paymentMethod);
      let payment = await UserPayMethods.create({
        user_id,
        id: paymentMethod,
        type: 'card',
        last_4_card_no: card.last4,
        brand: card.brand,
        country: card.country,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
      });
      await User.updateOne(
        { _id: user_id },
        {
          $push: { payment_methods: payment._id },
          customer_id: customer,
        },
      );
      logger.info(`card source is successfully created with id: ${payment._id}`);
      return res.status(200).json({
        message: 'Card source is successfully created.',
      });
    } else {
      logger.info(`something is wrong, please try again later.`);
      return res.status(400).json({
        message: 'something is wrong, please try again later.',
      });
    }
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
