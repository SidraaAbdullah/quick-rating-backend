const mongoose = require('mongoose');
const schema = mongoose.Schema;

const managerSchema = new schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
  },
  restaurant_id: [
    {
      type: schema.Types.ObjectId,
      required: true,
      ref: 'waiter-restaurants',
    },
  ],
  restaurant_address: {
    type: String,
  },
  postal_code: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});
managerSchema.set('timestamps', true);
module.exports = mongoose.model('managers', managerSchema);
