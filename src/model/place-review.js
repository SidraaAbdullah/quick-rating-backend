const mongoose = require('mongoose');
const schema = mongoose.Schema;

const placeReviewSchema = new mongoose.Schema({
  user_id: {
    type: schema.Types.ObjectId,
    require: true,
    ref: 'user',
  },
  rating: {
    type: Number,
    require: true,
  },
  comment: {
    type: String,
    require: true,
  },
  place_id: {
    type: schema.Types.ObjectId,
    require: true,
    ref: 'waiter-restaurants',
  },
});

placeReviewSchema.set('timestamps', true);
module.exports = mongoose.model('place-review', placeReviewSchema);
