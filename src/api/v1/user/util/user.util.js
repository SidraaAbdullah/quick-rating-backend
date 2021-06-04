const appRoot = require('app-root-path');
const { uploadFile } = require(appRoot + '/src/util/s3-upload');
const logger = require(appRoot + '/src/logger').apiLogger;
const User = require(appRoot + '/src/model/user');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const WaiterVoting = require(appRoot + '/src/model/waiter-voting');
const Waiter = require(appRoot + '/src/model/waiter');
const RestaurantUtil = require(appRoot + '/src/api/v1/restaurants/util/restaurants.util');
const Util = require(appRoot + '/src/util');

// In this method we will get users against query
exports.getUsers = async (params, query, sortByUser) => {
  try {
    const skipPage = parseInt(params.page_no) - 1;
    const limitPage = parseInt(params.records_per_page);
    const skipDocuments = skipPage * limitPage;
    let users = [];
    if (params.page_no && params.records_per_page) {
      users = await User.find(query).skip(skipDocuments).limit(limitPage).sort(sortByUser);
    } else {
      users = await User.find(query).sort(sortByUser);
    }
    if (params.is_all_data) {
      users = await this.populateUsersData(users);
    }
    return users;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return [];
  }
};
// Is Google user in DB
exports.isGoogleUserStored = async (id) => {
  try {
    logger.info('Searching user in database');
    let isAvailable = await User.find({ google_id: id });
    logger.info(`User availability: ${isAvailable.length}`);
    return { exists: isAvailable.length, user: isAvailable[0] };
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return false;
  }
};
// Create google user in database
exports.addGoogleUserInDb = async ({
  email,
  family_name,
  given_name,
  name,
  id,
  locale,
  picture,
  verified_email,
  city,
  login_type,
  mobile_type,
  os,
}) => {
  try {
    logger.info('adding user in [addGoogleUserInDb]');
    const buffer = await Util.bufferImageByUrl(picture);
    const url = await uploadFile(buffer, 'users-images');
    await User.create({
      email,
      family_name,
      given_name,
      full_name: name,
      google_id: id,
      locale,
      picture: url,
      verified_email,
      city,
      login_type,
      mobile_type,
      last_login_at: new Date(),
      os,
    });
    logger.info('Getting user from db');
    const user = await User.findOne({ google_id: id });
    return user;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return `user creating error ${error}`;
  }
};
exports.addToRestaurant = async ({ user_id, restaurant, waiter }) => {
  try {
    const {
      place_id,
      name,
      vicinity,
      photos,
      rating,
      formatted_address,
      our_rating,
      location,
      international_phone_number,
    } = restaurant;
    const restaurantStored = await Restaurant.findOne({ place_id });
    if (restaurantStored) {
      if (user_id) {
        logger.info('Restaurant already exist, adding user_id and waiter_id in array');
        const res = await Restaurant.findOneAndUpdate(
          {
            place_id,
          },
          {
            $push: { waiter_id: waiter._id, user_id },
          },
        );
        return {
          ...res._doc,
          waiter_id: [...res._doc.waiter_id, waiter._id],
          user_id: [...res._doc.user_id, user_id],
          waiter,
        };
      }
      logger.info(
        'Restaurant already exist,added waiter is not an application user, adding waiter_id in array',
      );
      const res = await Restaurant.findOneAndUpdate(
        {
          place_id,
        },
        {
          $push: { waiter_id: waiter._id },
        },
      );
      return {
        ...res._doc,
        waiter_id: [...res._doc.waiter_id, waiter._id],
        user_id: [...res._doc.user_id],
        waiter,
      };
    }
    logger.info('Restaurant does not exist, Creating restaurant');
    const res = await Restaurant.create({
      waiter_id: waiter._id,
      user_id,
      place_id,
      name,
      vicinity,
      photos,
      rating,
      formatted_address,
      our_rating,
      location,
      international_phone_number,
    });
    logger.info('Successfully created restaurant.');
    const waiterRestaurant = await Restaurant.findOne({ _id: res._id });
    return { ...waiterRestaurant._doc, waiter };
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return `user creating error ${error}`;
  }
};
exports.addWaiterAndRestaurant = async ({
  user_id,
  restaurant,
  company_name,
  business_registration_number,
  manager_name,
  manager_contact,
  full_name,
  created_by,
  email,
}) => {
  try {
    logger.info('Adding waiter to db');
    const { place_id } = restaurant;
    const res = await Waiter.create({
      restaurant_id: place_id,
      user_id,
      company_name,
      business_registration_number,
      manager_name,
      manager_contact,
      full_name,
      created_by,
      email,
    });
    if (user_id) {
      await User.updateOne(
        { _id: user_id },
        {
          is_waiter: true,
        },
      );
    }
    logger.info('Checking if restaurant already exist in db');
    const waiter = await Waiter.findOne({
      _id: res._id,
    });
    const waiterRestaurant = await this.addToRestaurant({
      user_id,
      restaurant,
      waiter,
    });
    return waiterRestaurant;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return `user creating error ${error}`;
  }
};

exports.getUserDetail = async (id, user) => {
  try {
    logger.info(`Getting list of waiters generated by user with id: ${id}`);
    const waiters = await Waiter.find({ created_by: id });
    let filteredWaiters = [];
    for (const waiter of waiters) {
      const restaurant = await RestaurantUtil.getRestaurantByPlaceId(waiter.restaurant_id);
      filteredWaiters.push({ ...waiter._doc, restaurant });
    }
    const userVotes = await WaiterVoting.find({ user_id: id });
    const waiters_created = await Waiter.find({ created_by: id });
    return {
      ...user._doc,
      waiters: filteredWaiters,
      userVotes,
      waiters_created,
    };
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return `user details error ${error}`;
  }
};

exports.populateUsersData = async (users) => {
  try {
    logger.info(`Populating user data`);
    let populatedUsers = [];
    if (users) {
      for (const user of users) {
        logger.info(`Populating votes in user data with id: ${user._id}`);
        const details = await this.getUserDetail(user._id, user);
        populatedUsers.push(details);
      }
    }
    return populatedUsers;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return `user details error ${error}`;
  }
};

exports.buildQuery = async (params) => {
  try {
    logger.info('Build query for users');
    let query = {};
    if (params.full_name) {
      query = {
        ...query,
        full_name: { $regex: params.full_name.trim(), $options: 'i' },
      };
    }
    return query;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return `user details error ${error}`;
  }
};

exports.patchUpdateQuery = async (params) => {
  try {
    logger.info('starting [patchUpdateQuery] in users');
    let query = {};
    if (params.first_name) {
      query = {
        ...query,
        full_name: params.first_name,
      };
    }
    if (params.last_name) {
      query = {
        ...query,
        last_name: params.last_name,
      };
    }
    if (params.email) {
      query = {
        ...query,
        email: params.email,
        verified_email: false,
      };
    }
    if (params.phone_number) {
      query = {
        ...query,
        phone_number: params.phone_number,
      };
    }
    if (params.expo_notification_token) {
      query = {
        ...query,
        expo_notification_token: params.expo_notification_token,
      };
    }
    if (params.lang) {
      query = {
        ...query,
        lang: params.lang,
      };
    }
    return query;
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return `user details error ${error}`;
  }
};
