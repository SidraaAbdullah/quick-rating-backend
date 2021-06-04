const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const stripeUtility = require(appRoot + '/src/util/stripe-util');
const createCardPayment = stripeUtility.createCardPaymentMethod();
const createCustomer = stripeUtility.createCustomer();
const config = require('config');
const STRIPE_SECRET_ACCESS_KEY = config.get('stripe.secretKey');
const stripe = require('stripe')(STRIPE_SECRET_ACCESS_KEY);
module.exports = {
  createCustomerWithPaymentMethod: async function (token, customer_id, user) {
    try {
      logger.info(`starting stripeUtilMethod [createCustomerWithPaymentMethod]`);
      logger.info(`calling [createCustomer.createCustomer] to create customer on stripe`);
      if (!customer_id) {
        const customer = await createCustomer.createCustomer(user, token);
        if (customer) {
          customer_id = customer.id;
        } else {
          return null;
        }
      }
      logger.info(
        `calling [createCardPayment.createCardPaymentMethod] to create customer on stripe`,
      );
      const paymentMethod = await createCardPayment.createCardSourceWithToken(token, customer_id);
      if (paymentMethod) {
        logger.info(
          `ending [createCardPayment.createCardPaymentMethod] returning with paymentId: ${paymentMethod.id}`,
        );
        return { customer: customer_id, paymentMethod: paymentMethod.id };
      } else {
        return null;
      }
    } catch (error) {
      logger.error(JSON.stringify((error = error.stack)));
      return null;
    }
  },
};
