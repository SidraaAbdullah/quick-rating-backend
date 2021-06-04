const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const User = require(appRoot + '/src/model/user');

exports.validateUserByParams = async (req, res, next) => {
  try {
    logger.info('starting [validateUserByParams]');
    let id = req.params.id;
    if (req.body.user_id) {
      id = req.body.user_id;
    }
    const user = await User.findById(id);
    if (!user) {
      logger.info(`Invalid Request. user not found with id: ${id}.`);
      return res.status(404).json({
        message: 'Invalid Request. user not found.',
      });
    }
    logger.info(`user found with id:${user._id}`);
    next();
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    return res.status(500).json({
      message: 'Internal Server Error. Please try again later.',
      error: error,
    });
  }
};
