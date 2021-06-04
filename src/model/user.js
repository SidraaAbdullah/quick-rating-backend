const mongoose = require('mongoose');
const schema = mongoose.Schema;
const appRoot = require('app-root-path');
const constant = require(appRoot + '/src/constant');

const userSchema = new schema({
  full_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  email: {
    type: String,
  },
  google_id: {
    type: String,
    required: true,
  },
  given_name: {
    type: String,
  },
  family_name: {
    type: String,
  },
  locale: {
    type: String,
  },
  picture: {
    type: String,
  },
  verified_email: {
    type: String,
  },
  is_waiter: {
    type: Boolean,
  },
  status: {
    type: String,
    default: constant.USER_STATUSES.STATUS_REGISTERED,
  },
  last_login_at: {
    type: String,
  },
  login_type: {
    type: String,
  },
  city: {
    type: String,
  },
  mobile_type: {
    type: String,
  },
  os: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  payment_methods: [
    {
      type: schema.Types.ObjectId,
      ref: 'user_payment_methods',
    },
  ],
  customer_id: {
    type: String,
  },
  default_source: {
    type: String,
  },
  expo_notification_token: {
    type: String,
  },
  lang: {
    type: String,
  },
});
userSchema.set('timestamps', true);
module.exports = mongoose.model('user', userSchema);
