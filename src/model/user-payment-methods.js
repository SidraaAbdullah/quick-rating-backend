const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userPaymentMethodsSchema = new schema({
  user_id: {
    type: schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  last_4_card_no: {
    type: String,
  },
  brand: {
    type: String,
  },
  country: {
    type: String,
  },
  exp_month: {
    type: Number,
  },
  exp_year: {
    type: Number,
  },
});
userPaymentMethodsSchema.set('timestamps', true);
module.exports = mongoose.model('user_payment_methods', userPaymentMethodsSchema);
