const mongoose = require('mongoose');
const schema = mongoose.Schema;
const appRoot = require('app-root-path');
const constant = require(appRoot + '/src/constant');
const WaiterRatingSchema = require('./waiter-rating');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const waitersVotingSchema = new schema({
  waiter_id: {
    // Waiter who gets the vote
    type: schema.Types.ObjectId,
    required: true,
    ref: 'restaurant-waiters',
  },
  restaurant_id: {
    // Id of restaurant whose waiter is of.
    type: String,
    required: true,
  },
  place_id: {
    // Id of restaurant(database) whose waiter is of.
    type: schema.Types.ObjectId,
    ref: 'waiter-restaurants'
  },
  user_id: {
    // User who tipped
    type: schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  overall_rating: {
    type: String,
  },
  currency: {
    type: String,
  },
  rating: {
    type: WaiterRatingSchema,
    required: true,
  },
  tip: {
    type: String,
    required: true,
  },
});
waitersVotingSchema.set('timestamps', true);
waitersVotingSchema.plugin(AutoIncrement, {
  inc_field: 'token',
  id: 'counter',
});
module.exports = mongoose.model('waiters-voting', waitersVotingSchema);
