const mongoose = require('mongoose');
const schema = mongoose.Schema;

const restaurantPhotosSchema = new schema({
  place_id: {
    type: String,
    unique: true,
    required: true,
  },
  photos: [
    {
      type: String,
    },
  ],
});
restaurantPhotosSchema.set('timestamps', true);
module.exports = mongoose.model('restaurant-photos', restaurantPhotosSchema);
