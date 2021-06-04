const axios = require('axios');
const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const constants = require(appRoot + '/src/constant');
const waiter = require(appRoot + '/src/model/waiter.js');
const googleApi = require('./google-apis');
const { PICTURES } = require('../../../../constant');
const paginationUtil = require(appRoot + '/src/util/pagination');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const Waiter = require(appRoot + '/src/model/waiter');
const _get = require('lodash/get');

exports.getAllWaiterRestaurants = async (id, query) => {
  try {
    const { location = { lat: '24.9408855', log: '67.0644976' }, page_no, max_results } = query;
    let restaurants = [];
    const limit = paginationUtil.infiniteScrollPagination(max_results, page_no).limit;
    if (page_no && max_results) {
      restaurants = await Restaurant.find({
        user_id: { $in: [id] },
      }).limit(limit);
    } else {
      restaurants = await Restaurant.find({
        user_id: { $in: [id] },
      });
    }
    let places = {};
    for (const res in restaurants) {
      let distance = '';
      let waiterRestaurant = restaurants[res];
      const { place_id } = waiterRestaurant;
      // const parseLocation = JSON.parse(location);
      const registeredWaiter = await waiter.findOne({
        user_id: id,
        restaurant_id: place_id,
        status: constants.WAITER_ACTIVE,
      });
      const servers = await waiter.countDocuments({
        restaurant_id: place_id,
        status: constants.WAITER_ACTIVE,
      });
      // distance = await googleApi.getDistanceFromLatLonInKm(
      //   parseLocation.lat,
      //   parseLocation.log,
      //   place_id,
      // );
      if (registeredWaiter) {
        places.results = [
          ...(places.results || []),
          {
            waiter: registeredWaiter,
            ...waiterRestaurant._doc,
            servers,
          },
        ];
      }
    }

    return {
      restaurants: places,
    };
  } catch (error) {
    logger.error(JSON.stringify(error));
    console.log(error);
    return null;
  }
};

exports.modifyRestaurantDetails = async (place, location) => {
  try {
    const { place_id, photos = [] } = place || {};
    let distance = '';
    let photoReferences = [''];
    if (PICTURES) {
      photoReferences = await googleApi.photoRefToPictures(photos, place_id);
    }
    // distance api comment for now.

    // distance = await googleApi.getDistanceFromLatLonInKm(
    //   location.lat,
    //   location.log,
    //   place_id,
    // );
    const servers = await waiter.countDocuments({
      restaurant_id: place_id,
      status: constants.WAITER_ACTIVE,
    });
    return {
      photoReferences,
      distance,
      servers,
    };
  } catch (error) {
    logger.error(JSON.stringify(error));
    console.log(error);
    return null;
  }
};

exports.getRestaurantByPlaceId = async (id) => {
  try {
    logger.info(`getting restaurant with id: ${id}`);
    const restaurant = await Restaurant.findOne({ place_id: id });
    logger.info(`restaurant: ${restaurant}`);
    return restaurant;
  } catch (error) {
    logger.error(JSON.stringify(error));
    console.log(error);
    return null;
  }
};

exports.updateQuery = async (body, place_id) => {
  try {
    logger.info(`updating restaurant with query: ${JSON.stringify(body)}`);
    let query = {};
    if (!Object.keys(body).length) {
      return {
        message: 'empty body nothing to update',
      };
    }
    if (body.menu_url) {
      if (
        !body.photos &&
        !body.rating &&
        !body.name &&
        !body.formatted_address &&
        !body.our_rating &&
        !place_id
      ) {
        return {
          message:
            'Invalid restaurant details,Please return photos,rating,name,place_id,our_rating and formatted_address',
        };
      }
      const restaurant = await this.getRestaurantByPlaceId(place_id);
      if (restaurant) {
        query = {
          ...query,
          menu_url: body.menu_url,
        };
      } else {
        query = {
          ...query,
          menu_url: body.menu_url,
          photos: body.photos,
          rating: body.rating,
          name: body.name,
          formatted_address: body.formatted_address,
          place_id,
          location: body.location,
          international_phone_number: body.international_phone_number,
        };
        const res = await Restaurant.create(query);
        return {
          message: 'Restaurant created and menu url added',
          isCreated: true,
          restaurant_id: res.id,
        };
      }
    }
    if (body.menu_url === 'empty') {
      query = {
        ...query,
        menu_url: '',
      };
    }
    if (!Object.keys(query).length) {
      return {
        message: 'empty body nothing to update',
      };
    }
    return { ...query, isUpdated: true };
  } catch (error) {
    logger.error(JSON.stringify(error));
    console.log(error);
    return null;
  }
};

exports.restaurantBuildQuery = async (query) => {
  try {
    logger.info(`building useable query for restaurant with: ${query}`);
    let newQuery = {};
    const { page_no, records_per_page, ...remainingQuery } = query || {};
    if (remainingQuery.name) {
      newQuery = {
        ...newQuery,
        name: { $regex: remainingQuery.name.trim(), $options: 'i' },
      };
    }
    return newQuery;
  } catch (error) {
    logger.error(JSON.stringify(error));
    console.log(error);
    return null;
  }
};

exports.getRestaurants = async (query, sortBy) => {
  try {
    let restaurants = [];
    logger.info(`searching restaurant with query: ${JSON.stringify(query)}`);
    const buildQuery = await this.restaurantBuildQuery(query);
    if (query.page_no && query.records_per_page) {
      logger.info(`searching restaurant page_no`);
      const skipPage = parseInt(query.page_no) - 1;
      const limitPage = parseInt(query.records_per_page);
      const skipDocuments = skipPage * limitPage;
      restaurants = await Restaurant.find(buildQuery)
        .populate({
          path: 'waiter_id',
          populate: 'user_id',
          match: { status: constants.WAITER_ACTIVE },
        })
        .skip(skipDocuments)
        .limit(limitPage)
        .sort(sortBy);
    } else {
      logger.info(`searching restaurant without page_no`);
      restaurants = await Restaurant.find(buildQuery)
        .populate({
          path: 'waiter_id',
          populate: 'user_id',
          match: { status: constants.WAITER_ACTIVE },
        })
        .sort(sortBy);
    }
    return { restaurants, buildQuery };
  } catch (error) {
    logger.error(JSON.stringify(error));
    console.log(error);
    return null;
  }
};

exports.modifySearchRestaurants = async (restaurantsByGoogleApi) => {
  try {
    let modifiedRestaurants = [];
    for (const restaurant of restaurantsByGoogleApi) {
      const photos = await googleApi.photoRefToPictures(
        restaurant.photos || [],
        restaurant.place_id,
      );
      let res = await Restaurant.findOne({ place_id: restaurant.place_id });
      if (!res) {
        res = await Restaurant.create({
          photos,
          place_id: restaurant.place_id,
          name: restaurant.name,
          formatted_address: restaurant.formatted_address,
          rating: restaurant.rating,
          location: _get(restaurant, 'geometry.location', {}),
        });
      }
      let dbRestaurant = res || {};
      modifiedRestaurants = [
        ...modifiedRestaurants,
        { ...restaurant, ...dbRestaurant._doc, photos },
      ];
    }
    return modifiedRestaurants;
  } catch (error) {
    logger.error(JSON.stringify(error));
    console.log(error);
    return null;
  }
};

exports.updateAndGetRestaurantRating = async (place) => {
  try {
    const place_id = place.place_id || place;
    const query = { restaurant_id: place_id };
    const waitersCount = await Waiter.countDocuments(query);
    let our_rating = 0;
    if (waitersCount >= 10) {
      const waiters = await Waiter.find(query);
      for (const waiter of waiters) {
        our_rating += Number(waiter.rating);
      }
      our_rating = our_rating / waitersCount;
    }
    if (our_rating) {
      await Restaurant.updateOne(
        { place_id },
        {
          our_rating,
        },
      );
    }
    return { our_rating: String(our_rating) };
  } catch (error) {
    logger.error(JSON.stringify(error));
    console.log(error);
    return null;
  }
};
