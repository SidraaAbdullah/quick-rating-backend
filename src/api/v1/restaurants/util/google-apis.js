const axios = require('axios');
const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const constants = require(appRoot + '/src/constant');
const restaurantUtil = require('./restaurants.util');
const { restaurantPhotosParams, uploadFile } = require('./restaurant-image-s3');
const RestaurantPhotos = require(appRoot + '/src/model/restaurant-photos');
const Util = require(appRoot + '/src/util');

exports.getRestaurantByGoogleApi = async ({
  location = { lat: '24.9408855', log: '67.0644976' },
  language = 'fr',
  next_page_token,
  search,
  category,
}) => {
  try {
    let places = {},
      data = [];
    if (!search) {
      data = await getRestaurantsData({
        location,
        language,
        pagetoken: next_page_token,
        category,
      });
    } else {
      data = await getRestaurantsData({
        location,
        language,
        search,
        pagetoken: next_page_token,
        category,
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
      // const place = await restaurantUtil.getRestaurantByPlaceId(
      //   place.place_id,
      // );
      let { our_rating } = await restaurantUtil.updateAndGetRestaurantRating(place);

      places.results = [
        {
          ...place,
          distance,
          photos: photoReferences,
          servers,
          // menu_url: _get(place, 'menu_url', ''),
          our_rating: our_rating || 0,
          // restaurant_id: _get(place, '_id', ''),
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
      `Calculating distance between current location:${(lat1, lon1)} and place id:${place_id}!`,
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

const getRestaurantsData = async ({ location, language, pagetoken, search, category }) => {
  try {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=${
        search ? 100000 : 5000
      }`,
      {
        params: {
          type: category || 'restaurant',
          key: constants.GOOGLE_API_KEY,
          location: `${location.lat},${location.log}`,
          language,
          ...(pagetoken && { pagetoken }),
          opennow: true,
          keyword: search,
        },
      },
    );
    logger.info(`successfully get restaurants`);
    return data;
  } catch (error) {
    console.log(error);
    logger.error(JSON.stringify(error));
    return {};
  }
};

exports.getPlace = async (place_id) => {
  try {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?fields=international_phone_number,reviews`,
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
        `place photos found in db of place_id:${place_id}, photos:${JSON.stringify(
          restaurant_images.photos,
        )}`,
      );
      return restaurant_images.photos;
    }
    logger.info(`place photos not found in db of place_id:${place_id}`);
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
    logger.info(`place photos created and stored in db`);
    return urls;
  } catch (error) {
    logger.error(error);
    console.log(error);
    return null;
  }
};
exports.getReviews = async (place_id) => {
  try {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?fields=reviews`,
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
