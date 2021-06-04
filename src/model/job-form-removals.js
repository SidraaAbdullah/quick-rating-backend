const mongoose = require('mongoose');
const schema = mongoose.Schema;

const JobFormRemovalSchema = new schema({
  manager_id: {
    type: schema.Types.ObjectId,
    required: true,
  },
  form_id: {
    type: schema.Types.ObjectId,
    required: true,
  },
  form_updatedAt: {
    type: String,
  },
});
JobFormRemovalSchema.set('timestamps', true);
module.exports = mongoose.model('job-form-removal', JobFormRemovalSchema);
