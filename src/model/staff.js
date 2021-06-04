const mongoose = require('mongoose');
const schema = mongoose.Schema;
const appRoot = require('app-root-path');
const constant = require(appRoot + '/src/constant');

const staffSchema = new schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  manager_id: {
    type: schema.Types.ObjectId,
    required: true,
    ref: 'managers',
  },
  type: {
    type: String,
    enum: constant.STAFFS,
  },
});
staffSchema.set('timestamps', true);
module.exports = mongoose.model('staff', staffSchema);
