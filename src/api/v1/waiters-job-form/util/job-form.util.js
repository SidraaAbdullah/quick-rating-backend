const appRoot = require('app-root-path');
const { getUserWaiterRating } = require('../../waiters/util/waiters.util');
const WaiterVotingUtil = require(appRoot + '/src/api/v1/waiters-voting/util/waiter-voting-util');
const logger = require(appRoot + '/src/logger').apiLogger;
const Waiter = require(appRoot + '/src/model/waiter');
const WaiterJobForm = require(appRoot + '/src/model/waiter-job-form');
const constant = require(appRoot + '/src/constant');
const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
const User = require(appRoot + '/src/model/user');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const JobFormRemoval = require(appRoot + '/src/model/job-form-removals');
const _get = require('lodash/get');
// In this method we will build query to find waiters
exports.buildQuery = async (params) => {
  try {
    let query = {};

    if (params.search) {
      const user_id = await User.find({ city: params.search });
      query = {
        ...query,
        $or: [
          { full_name: { $regex: params.search.trim(), $options: 'i' } },
          { last_name: { $regex: params.search.trim(), $options: 'i' } },
          { position: { $regex: params.search.trim(), $options: 'i' } },
          { user_id: { $in: user_id } },
        ],
      };
    }
    if (params.position) {
      query = {
        ...query,
        position: { $regex: params.position.trim(), $options: 'i' },
      };
    }
    if (params.time?.length) {
      query = {
        ...query,
        time: { $in: params.time },
      };
    }
    if (params.experience_greater && params.experience_less) {
      query = {
        ...query,
        experience_count: { $gte: +params.experience_less, $lte: +params.experience_greater },
      };
    }
    if (params.rating) {
      const data = await WaiterJobForm.find();
      let userIds = [];
      for (const form of data) {
        const rating = await getUserWaiterRating(form.user_id);
        if (Math.floor(rating) == params.rating) {
          userIds = [...userIds, form.user_id];
        }
      }
      userIds = [...new Set(userIds)];
      query = {
        ...query,
        user_id: { $in: userIds },
      };
    }
    if (params.first_item == 'true') {
      const data = await WaiterJobForm.find().distinct('user_id');
      let formIds = [];
      for (const user_id of data) {
        const userForm = await WaiterJobForm.findOne({ user_id }).sort({ createdAt: -1 });
        formIds = [...formIds, userForm._id];
      }
      query = {
        ...query,
        _id: { $in: formIds },
      };
    }
    if (params.filtered_list === 'true') {
      const data = await WaiterJobForm.find();
      let formIds = [];
      for (const form of data) {
        const isAdding = await JobFormRemoval.findOne({
          manager_id: params.manager_id,
          form_id: form._id,
          form_updatedAt: form.updatedAt,
        });
        if (isAdding) {
          formIds = [...formIds, form._id];
        }
      }
      query = {
        ...query,
        _id: { ..._get(query, '_id', {}), $nin: formIds },
      };
    }
    if (params.form_id) {
      query = {
        ...query,
        _id: params.form_id,
      };
    }
    if (params.user_id) {
      const userForm = await WaiterJobForm.findOne({ user_id: params.user_id }).sort({
        createdAt: -1,
      });
      query = {
        ...query,
        _id: userForm?._id,
      };
    }
    return query;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
  }
};

exports.populateData = async (data, query) => {
  try {
    const { rating_needed } = query;
    let custom_data = data;
    const isLoop = rating_needed === 'true';
    custom_data = [];
    let form_data = {};
    if (isLoop) {
      for (const form of data) {
        if (rating_needed === 'true') {
          const rating = await getUserWaiterRating(form.user_id._id);
          form_data = { rating };
          custom_data = [...custom_data, { ...form._doc, form_data }];
        }
      }
    } else {
      custom_data = data;
    }
    return custom_data;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
  }
};
