const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const Util = require('./index');
exports.pagination = (maxResult, page_no) => {
  const skipPage = parseInt(page_no) - 1;
  const limit = parseInt(maxResult);
  return {
    limit,
    skip: skipPage * limit,
  };
};

exports.infiniteScrollPagination = (maxResult, page_no) => {
  return {
    limit: maxResult * page_no,
  };
};

exports.paginateData = async (model, query, params, props = {}) => {
  try {
    logger.info('[paginateData] for returning data with respect to every model');
    const sortBy = Util.sortBy(params.sort_by, params.order);
    let data = [];
    const { restaurant_id } = props;
    if (params.page_no && params.records_per_page) {
      const skipPage = parseInt(params.page_no) - 1;
      const limitPage = parseInt(params.records_per_page);
      const skipDocuments = skipPage * limitPage;
      if (restaurant_id) {
        data = await model
          .find(query)
          .populate('user_id')
          .populate({ path: `waiter_id`, populate: `user_id` })
          .populate('place_id')
          .skip(skipDocuments)
          .limit(limitPage)
          .sort(sortBy);
      } else {
        data = await model
          .find(query)
          .populate('user_id')
          .populate({ path: `waiter_id`, populate: `user_id` })
          .populate('place_id')
          .populate('restaurant_id')
          .skip(skipDocuments)
          .limit(limitPage)
          .sort(sortBy);
      }
    } else {
      if (restaurant_id) {
        data = await model
          .find(query)
          .populate('user_id')
          .populate('waiter_id')
          .populate({ path: 'place_id', select: 'name' })
          .sort(sortBy);
      } else {
        data = await model
          .find(query)
          .populate('user_id')
          .populate('waiter_id')
          .populate('restaurant_id')
          .populate({ path: 'place_id', select: 'name' })
          .sort(sortBy);
      }
    }
    const count = await model.countDocuments(query);
    logger.info('ending [paginateData] for returning data with respect to every model');
    return { data, count };
  } catch (error) {
    console.log(error);
    logger.error(JSON.stringify((error = error.stack)));
  }
};
