const mongoose = require('mongoose');
const schema = mongoose.Schema;
const appRoot = require('app-root-path');
const constant = require(appRoot + '/src/constant');

const restaurantExperience = new schema({
  enterprise_name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  start_date: {
    type: String,
  },
  end_date: {
    type: String,
  },
  still_working: {
    type: Boolean,
  },
  restaurant_id: {
    type: schema.Types.ObjectId,
    ref: 'waiter-restaurants',
  },
});

const waitersJobFormSchema = new schema({
  full_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  telephone_number: {
    type: String,
  },
  diploma: {
    type: String,
  },
  user_id: {
    type: schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  experience: [restaurantExperience],
  last_experience: {
    type: Object,
  },
  education: {
    type: String,
  },
  time: {
    type: String,
    enum: constant.WAITER_TIME,
  },
  position: {
    type: String,
  },
  experience_count: {
    type: Number,
    default: 0,
  },
  availability: [
    {
      day: {
        type: String,
      },
      slot: {
        type: Array,
      },
    },
  ],
});
waitersJobFormSchema.set('timestamps', true);
module.exports = mongoose.model('waiter-job-form', waitersJobFormSchema);
