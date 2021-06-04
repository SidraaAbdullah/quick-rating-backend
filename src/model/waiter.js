const mongoose = require('mongoose');
const schema = mongoose.Schema;
const appRoot = require('app-root-path');
const constant = require(appRoot + '/src/constant');

const waitersSchema = new schema({
  full_name: {
    type: String,
  },
  email: {
    type: String,
  },
  restaurant_id: {
    type: String,
    required: true,
  },
  locale: {
    type: String,
  },
  picture: {
    type: String,
  },
  user_id: {
    type: schema.Types.ObjectId,
    ref: 'user',
  },
  created_by: {
    type: schema.Types.ObjectId,
    ref: 'user',
  },
  last_login_at: {
    type: String,
  },
  company_name: {
    type: String,
  },
  business_registration_number: {
    type: String,
  },
  manager_name: {
    type: String,
  },
  manager_contact: {
    type: String,
  },
  rating: {
    type: String,
    default: '0',
  },
  status: {
    type: String,
    enum: constant.WAITER_STATUSES,
    default: constant.WAITER_PENDING,
  },
});
waitersSchema.index({ restaurant_id: 1, user_id: 1 }, { unique: true });
waitersSchema.set('timestamps', true);
module.exports = mongoose.model('restaurant-waiters', waitersSchema);
