const axios = require('axios');
const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const constants = require(appRoot + '/src/constant');
const waiter = require(appRoot + '/src/model/waiter.js');
const restaurantUtil = require('./restaurants.util');
const _get = require('lodash/get');
const { restaurantPhotosParams, uploadFile } = require('./restaurant-image-s3');
const RestaurantPhotos = require(appRoot + '/src/model/restaurant-photos');
const Util = require(appRoot + '/src/util');
const Waiter = require(appRoot + '/src/model/waiter');

exports.getRestaurantByGoogleApi = async ({
  location = { lat: '24.9408855', log: '67.0644976' },
  language = 'fr',
  next_page_token,
  search,
}) => {
  try {
    let places = {},
      data = [];
    if (!search) {
      data = await getRestaurantsData({
        location,
        language,
        pagetoken: next_page_token,
      });
    } else {
      data = await getRestaurantsData({
        location,
        language,
        search,
        pagetoken: next_page_token,
      });
    }
    logger.info(`Restaurant Data: ${JSON.stringify(data)}`);
    logger.info(`modifying places according to our needs`);
    places = { next_page_token: data.next_page_token, ...places };
    for (const p in data.results) {
      const place = data.results[p];
      const {
        photoReferences,
        distance = '',
        servers,
      } = await restaurantUtil.modifyRestaurantDetails(place, location);
      // const restaurant = await restaurantUtil.getRestaurantByPlaceId(
      //   place.place_id,
      // );
      let { our_rating } = await restaurantUtil.updateAndGetRestaurantRating(place);

      places.results = [
        {
          ...place,
          distance,
          photos: photoReferences,
          servers,
          // menu_url: _get(restaurant, 'menu_url', ''),
          our_rating: our_rating || 0,
          // restaurant_id: _get(restaurant, '_id', ''),
        },
        ...(places.results || []),
      ];
    }

    return places;
  } catch (error) {
    logger.error(error);
    console.log(error);
    return 'error';
  }
};

exports.getDistanceFromLatLonInKm = async (lat1, lon1, place_id) => {
  try {
    logger.info(
      `Calculating distance between current location:${
        (lat1, lon1)
      } and restaurant id:${place_id}!`,
    );
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lon1}&destinations=place_id:${place_id}&key=${constants.GOOGLE_API_KEY}`,
    );
    logger.info('successfully got the distance!');
    return data;
  } catch (error) {
    logger.error(error);
    console.log(error);
    return {};
  }
};

const getRestaurantsData = async ({ location, language, pagetoken, search }) => {
  try {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=${
        search ? 100000 : 5000
      }`,
      {
        params: {
          type: 'restaurant',
          key: constants.GOOGLE_API_KEY,
          location: `${location.lat},${location.log}`,
          language,
          ...(pagetoken && { pagetoken }),
          // opennow: true,
          keyword: search,
        },
      },
    );
    logger.info(`successfully get restaurants`);
    return data;
  } catch (error) {
    logger.error(JSON.stringify(error));
    return {};
  }
};

exports.getPlace = async (place_id) => {
  try {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?fields=international_phone_number`,
      {
        params: {
          place_id,
          key: constants.GOOGLE_API_KEY,
        },
      },
    );
    return data.result;
  } catch (error) {
    logger.error(error);
    console.log(error);
    return null;
  }
};

exports.searchRestaurant = async ({ search, language = 'fr' }) => {
  try {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=photos,formatted_address,name,rating,place_id,geometry`,
      {
        params: {
          key: constants.GOOGLE_API_KEY,
          inputtype: 'textquery',
          input: search,
          language,
        },
      },
    );
    return data;
  } catch (error) {
    logger.error(error);
    console.log(error);
    return null;
  }
};
exports.photoRefToPictures = async (photos, place_id) => {
  try {
    const restaurant_images = await RestaurantPhotos.findOne({ place_id });
    if (restaurant_images) {
      logger.info(
        `restaurant photos found in db of place_id:${place_id}, photos:${JSON.stringify(
          restaurant_images.photos,
        )}`,
      );
      return restaurant_images.photos;
    }
    logger.info(`restaurant photos not found in db of place_id:${place_id}`);
    const photoReferences = photos.map(
      (photo) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${400}&key=${
          constants.GOOGLE_API_KEY
        }&photoreference=${photo.photo_reference}`,
    );

    let uploadFilePromises = [];
    for (const photo of photoReferences) {
      const buffer = await Util.bufferImageByUrl(photo);
      const params = restaurantPhotosParams(buffer, place_id);
      uploadFilePromises.push(uploadFile(params));
    }
    const urls = await Promise.all(uploadFilePromises);
    await RestaurantPhotos.create({
      place_id,
      photos: urls,
    });
    logger.info(`restaurant photos created and stored in db`);
    return urls;
  } catch (error) {
    logger.error(error);
    console.log(error);
    return null;
  }
};
