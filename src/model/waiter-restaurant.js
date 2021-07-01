const mongoose = require('mongoose');
const schema = mongoose.Schema;

const restaurantSchema = new schema({
  // Place Id of the google
  place_id: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: [
    {
      type: schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  waiter_id: [
    {
      type: schema.Types.ObjectId,
      required: true,
      ref: 'restaurant-waiters',
    },
  ],
  rating: {
    type: String,
  },
  name: {
    type: String,
  },
  vicinity: {
    type: String,
  },
  photos: [
    {
      type: String,
    },
  ],
  formatted_address: {
    type: String,
  },
  menu_url: {
    type: String,
  },
  our_rating: {
    type: String,
    default: '0',
  },
  location: {
    type: Object,
  },
  international_phone_number: {
    type: String,
  },
  reviews: [
    new schema({
      author_name: { type: String },
      author_url: { type: String },
      profile_photo_url: { type: String },
      rating: { type: String },
      text: { type: String },
      time: { type: Number },
    }),
  ],
});
restaurantSchema.set('timestamps', true);
module.exports = mongoose.model('waiter-restaurants', restaurantSchema);
