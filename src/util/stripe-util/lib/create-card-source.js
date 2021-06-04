const appRoot = require('app-root-path');
const config = require('config');
const logger = require(appRoot + '/src/logger').apiLogger;
const STRIPE_SECRET_ACCESS_KEY = config.get('stripe.secretKey');
const stripe = require('stripe')(STRIPE_SECRET_ACCESS_KEY);

module.exports = {
  createCardSourceWithToken: async function (token, customerId) {
    try {
      logger.info(`starting stripeUtilMethod [createPaymentMethod]`);

      logger.info(
        `calling Stripe Api [paymentMethods.create] to create payment method on stripe  `,
      );
      const paymentMethod = await stripe.customers.createSource(customerId, {
        source: token,
      });
      if (paymentMethod) {
        logger.info(
          `Stripe  Customer created successfully returning CustomerId: ${paymentMethod.id}`,
        );
        return paymentMethod;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      logger.error(JSON.stringify((error = error.stack)));
      return null;
    }
  },
};
