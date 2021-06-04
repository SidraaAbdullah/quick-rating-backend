const jwt = require('jsonwebtoken');
const appRoot = require('app-root-path');
const logger = require(appRoot + '/src/logger').apiLogger;
const constant = require(appRoot + '/src/constant');

function auth(req, res, next) {
  const token = req.headers['authorization'];
  // check token

  if (!token) {
    logger.info('User is Unauthorized to access this api. return with status code 401');
    return res.status(401).json({
      message: 'No token, Auth Denied!!!',
      statusCode: constant.STATUS_UNAUTHORIZED,
      statusDesc: constant.STATUS_UNAUTHORIZED_DESC,
    });
  }

  try {
    //verify token;

    let protectedToken = token.slice('Bearer '.length);
    console.log(protectedToken);
    let decoded = jwt.verify(protectedToken, constant.JWT_SECRET_LOGIN);
    req.user = decoded;

    logger.info('User is Authorized to access this api');
    next();
  } catch (error) {
    logger.error(JSON.stringify((error = error.stack)));
    logger.info('User is Unauthorized to access this api. return with status code 401');
    res.status(400).json({
      message: 'Token Is Invalid!',
      statusCode: constant.STATUS_UNAUTHORIZED,
      statusDesc: constant.STATUS_UNAUTHORIZED_DESC,
    });
  }
}

module.exports = auth;
