const express = require('express');
const appRoot = require('app-root-path');
const router = express.Router();
const restaurantController = require('./restaurants.controller');
const cacheMiddleWare = require(appRoot + '/src/middlewares/cache');
const rateLimit = require('express-rate-limit');
const constants = require(appRoot + '/src/constant');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to  requests per windowMs
});

router.get('/', [cacheMiddleWare.cache(constants.CACHE_TIME)], restaurantController.getRestaurants);

router.get(
  '/detail/:id',
  [cacheMiddleWare.cache(constants.CACHE_TIME)],
  restaurantController.getRestaurantDetails,
);

router.get('/save', restaurantController.getSavedRestaurants);
router.patch('/:id', restaurantController.updateRestaurant);

router.get('/search/:id', restaurantController.searchRestaurants);

router.get('/:id', restaurantController.getWaiterRestaurants);
router.post('/review', restaurantController.createRestaurantReview);

module.exports = router;
