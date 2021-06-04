/*
 * @module
 * @description
 * Main entry point for Stripe Utility
 *
 */

'use strict';

module.exports = {
  // Create Customer on Stripe
  createCustomer: function () {
    return require('./lib/create-customer');
  },
  createCardPaymentMethod: function () {
    return require('./lib/create-card-source');
  },
  createCustomerWithPaymentMethod: function () {
    return require('./util/create-customer-with-card-source');
  },
  retrieveCardDetails: function () {
    return require('./lib/retrieve-card-details');
  },
};
