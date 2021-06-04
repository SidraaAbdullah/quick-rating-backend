const appRoot = require('app-root-path');
const config = require('config');
const logger = require(appRoot + '/src/logger').apiLogger;
const STRIPE_SECRET_ACCESS_KEY = config.get('stripe.secretKey');
const stripe = require('stripe')(STRIPE_SECRET_ACCESS_KEY);

module.exports = {
  retrieveCardDetails: async function (customer_id, card_id) {
    try {
      logger.info(`starting stripeUtilMethod [retrieveCardDetails]`);
      logger.info(`calling Stripe Api [customers.retrieveSource(] to create customer on stripe  `);
      const cardDetails = await stripe.customers.retrieveSource(customer_id, card_id);
      if (cardDetails) {
        logger.info(`Stripe card successfully retrieved returning CardId: ${cardDetails.id}`);
        return cardDetails;
      } else {
        return null;
      }
    } catch (error) {
      logger.error(JSON.stringify((error = error.stack)));
      return null;
    }
  },
};
