const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const constant = require(appRoot + '/src/constant');
const restaurantsValidation = require('./restaurants.validation');
const googleApis = require('./util/google-apis');
const restaurantUtil = require('./util/restaurants.util');
const Restaurant = require(appRoot + '/src/model/waiter-restaurant');
const PlaceReview = require(appRoot + '/src/model/place-review');
const Util = require(appRoot + '/src/util');

exports.getRestaurants = async (req, res) => {
  try {
    logger.info('In Restaurants - Validating restaurants');
    const { error } = restaurantsValidation.validateGetRestaurantsData.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    logger.info('All validations passed');
    const { location, language = '', pagetoken, search = '', category } = req.query;
    let restaurants = await googleApis.getRestaurantByGoogleApi({
      ...(location && { location: JSON.parse(location) }),
      language,
      pagetoken,
      search,
      category,
    });
    res.status(200).json({
      message: 'Restaurants data has been found successfully.',
      restaurants,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.getWaiterRestaurants = async (req, res) => {
  try {
    logger.info('In Waiters Restaurants - Validating waiters restaurants');
    const { error } = restaurantsValidation.validateGetWaiterRestaurantsData.validate(
      { ...req.query, id: req.params.id },
      {
        abortEarly: false,
      },
    );
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const { restaurants } = await restaurantUtil.getAllWaiterRestaurants(req.params.id, req.query);
    res.status(200).json({
      message: 'Restaurants data has been found successfully.',
      restaurants,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.searchRestaurants = async (req, res) => {
  try {
    logger.info('In Search Restaurants - Validating restaurants [searchRestaurants]');
    const search = req.params.id;
    const { language } = req.query;
    const { error } = restaurantsValidation.validateSearchRestaurantsData.validate(
      { id: search, ...req.query },
      {
        abortEarly: false,
      },
    );
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    logger.info(`searching for restaurant: ${search}`);
    const restaurantsByGoogleApi = await googleApis.searchRestaurant({
      language,
      search,
    });

    const restaurantsByGoogle = await restaurantUtil.modifySearchRestaurants(
      restaurantsByGoogleApi.candidates,
    );
    res.status(200).json({
      message: 'Restaurants data has been found successfully.',
      total_number_of_restaurants: restaurantsByGoogle.length,
      data: restaurantsByGoogle,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.getSavedRestaurants = async (req, res) => {
  try {
    logger.info('In Saved Restaurants - Validating [getSavedRestaurants] restaurants');
    const { error } = restaurantsValidation.validateSavedGetRestaurants.validate(
      { ...req.query },
      {
        abortEarly: false,
      },
    );
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const sortBy = Util.sortBy(req.query.sort_by, req.query.order);
    const { restaurants, buildQuery } = await restaurantUtil.getRestaurants(req.query, sortBy);
    const countRestaurants = await Restaurant.countDocuments(buildQuery);
    res.status(200).json({
      message: 'Restaurants data has been found successfully.',
      total_number_of_restaurants: countRestaurants,
      page_no: req.query.page_no,
      records_per_page: req.query.records_per_page,
      data: restaurants,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    logger.info('In update Restaurants - Validating [updateRestaurant] restaurants');
    const { error } = restaurantsValidation.validateUpdateRestaurants.validate(
      { ...req.body, id: req.params.id },
      {
        abortEarly: false,
      },
    );
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }

    const restaurantUpdateQuery = await restaurantUtil.updateQuery(req.body, req.params.id);
    if (restaurantUpdateQuery.isUpdated) {
      const { isUpdated, message, ...updatedRestaurantQuery } = restaurantUpdateQuery;
      await Restaurant.updateOne({ place_id: req.params.id }, updatedRestaurantQuery);
      const restaurant = await Restaurant.findOne({ place_id: req.params.id });
      return res.status(200).json({
        message: 'Restaurants data has been updated successfully.',
        data: restaurant,
      });
    }
    if (restaurantUpdateQuery.isCreated) {
      const restaurant = await Restaurant.findById(restaurantUpdateQuery.restaurant_id);
      return res.status(200).json({
        message: 'Restaurants has beed created and updated with menu_url successfully.',
        data: restaurant,
      });
    }
    logger.info(
      `In update Restaurants - Restaurant didn't updated with message: ${restaurantUpdateQuery.message}'`,
    );
    return res.status(400).json({
      message: 'Restaurant update error',
      error: restaurantUpdateQuery.message,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.getRestaurantDetails = async (req, res) => {
  try {
    const id = req.params.id;
    logger.info('In Restaurant detail API - Validating [getRestaurantDetails] restaurants');
    const { error } = restaurantsValidation.validateRestaurantDetails.validate(
      { ...req.query, id },
      {
        abortEarly: false,
      },
    );
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    // let details = await googleApis.getPlace(id);
    let details = {};
    const restaurant = await restaurantUtil.getRestaurantByPlaceId(id);
    // let { our_rating } = await restaurantUtil.updateAndGetRestaurantRating(id);
    details = {
      ...details,
      ...(restaurant?._doc || {}),
      // our_rating,
    };
    res.status(200).json({
      message: 'Restaurants details has been found successfully.',
      data: details,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};

exports.createRestaurantReview = async (req, res) => {
  try {
    logger.info('In Restaurant API - Validating [createRestaurantReview] restaurants');
    const { error } = restaurantsValidation.validateCreateRestaurantReview.validate(
      { ...req.body },
      {
        abortEarly: false,
      },
    );
    if (error) {
      logger.info(`Validation error ${JSON.stringify(error.details)}`);
      return res.status(400).json({
        message: 'Invalid Request. Please check and try again.',
        error: error.details,
      });
    }
    const { place, ...body } = req.body;
    const place_id = await restaurantUtil.getPlaceId(place);
    const review = await PlaceReview.create({ ...body, place_id });
    res.status(200).json({
      message: 'Restaurants review has been submitted!',
      data: review,
    });
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
