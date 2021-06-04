const multer = require('multer');
const appRoot = require('app-root-path');
const AWS = require('aws-sdk');
const config = require('config');
const { v4: uuidv4 } = require('uuid');
const Aws = config.get('aws');
const User = require(appRoot + '/src/model/user');
const logger = require(appRoot + '/src/logger').apiLogger;
const constants = require(appRoot + '/src/constant');

const s3 = new AWS.S3({
  accessKeyId: Aws.accessKeyId,
  secretAccessKey: Aws.secretAccessKey,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  },
});

exports.restaurantPhotosParams = (buffer, place_id) => {
  const params = {
    Bucket: Aws.bucketName,
    Key: `restaurants/${constants.ENVIRONMENT}/${place_id}/${uuidv4()}.jpg`, // random string with fileType
    Body: buffer,
  };
  return params;
};

exports.uploadFile = async (params) => {
  return new Promise(async function (resolve, reject) {
    await s3.upload(params, function (s3Err, data) {
      if (s3Err) {
        reject(s3Err);
      }
      logger.info(`File uploaded successfully at ${data?.Location}`);
      resolve(data?.Location);
    });
  });
};
