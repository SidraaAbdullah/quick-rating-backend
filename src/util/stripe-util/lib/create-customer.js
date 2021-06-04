const appRoot = require('app-root-path');
const config = require('config');
const logger = require(appRoot + '/src/logger').apiLogger;
const STRIPE_SECRET_ACCESS_KEY = config.get('stripe.secretKey');
const stripe = require('stripe')(STRIPE_SECRET_ACCESS_KEY);

module.exports = {
  createCustomer: async function (user, token) {
    try {
      logger.info(`starting stripeUtilMethod [createCustomer]`);

      logger.info(`calling Stripe Api [customer.create] to create customer on stripe  `);
      const createCustomer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { user_id: user.id },
        source: token,
      });
      if (createCustomer) {
        logger.info(
          `Stripe  Customer created successfully returning CustomerId: ${createCustomer.id}`,
        );
        return createCustomer;
      } else {
        return null;
      }
    } catch (error) {
      logger.error(JSON.stringify((error = error.stack)));
      return null;
    }
  },
};
