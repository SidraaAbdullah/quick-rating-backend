const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const googleApiUtil = require(appRoot +
  '/src/api/v1/restaurants/util/google-apis');
const constant = require(appRoot + '/src/constant');

exports.emailTemplate = async (restaurant, userDetails) => {
  return `<div>
      <div>
        <strong>Waiter's Name:</strong> ${userDetails.full_name}
    </div>
     <div><strong>Email:</strong> ${userDetails.email}</div>
      
	  <br>
	  <div><strong>Restaurant Name:</strong> ${restaurant.name}</div>
	  <br>
      <div><strong>Restaurant Location:</strong> ${restaurant.formatted_address}</div>
    </div>`;
};

exports.waiterAddEmailTemplate = async (restaurant, userDetails) => {
  return `<div>
        Hello ${userDetails.full_name},<br>
        As you are added in waiter list of Restaurant ${restaurant.name},
        Please create an account on Pourboir Application, It is available on Apple and Play Store.
    </div>`;
};

exports.userEmailAfterTippingTemplate = async (restaurant, userDetails, waiterVoting, tip, waiter) => {
  return `<div>
        Hello ${userDetails.full_name},<br>
        As you are added in waiter list of Restaurant ${restaurant.name},
        Please create an account on Pourboir Application, It is available on Apple and Play Store.
    </div>`;
};