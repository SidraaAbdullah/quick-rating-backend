const mongoose = require('mongoose');

const waiterRatingsSchema = new mongoose.Schema({
  hospitality: {
    type: Number,
    require: true,
  },
  speed: {
    type: Number,
    require: true,
  },
  service: {
    type: Number,
    require: true,
  },
  professionalism: {
    type: Number,
    require: true,
  },
});

module.exports = waiterRatingsSchema;
