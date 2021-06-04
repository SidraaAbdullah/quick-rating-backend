const multer = require('multer');
const appRoot = require('app-root-path');
const AWS = require('aws-sdk');
const config = require('config');
const { v4: uuidv4 } = require('uuid');
const Aws = config.get('aws');
const User = require(appRoot + '/src/model/user');
const logger = require(appRoot + '/src/logger').apiLogger;

const s3 = new AWS.S3({
  accessKeyId: Aws.accessKeyId,
  secretAccessKey: Aws.secretAccessKey,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  },
});

exports.upload = multer({ storage }).single('image'); // image will be use as a key whenever we upload a file

exports.uploadImageToS3 = async (req, res) => {
  let myFile = req.file.originalname.split('.');
  let fileType = myFile[myFile.length - 1];
  const params = {
    Bucket: Aws.bucketName,
    Key: `${uuidv4()}.${fileType}`, // random string with fileType
    Body: req.file.buffer,
  };

  s3.upload(params, async (error, data) => {
    if (error) {
      return res.status(500).json({
        message: 'Internal Server Error. Please try again later.',
        error: error,
      });
    }
    try {
      const id = req.params.id;
      logger.info(`Updating image to user Id :${id}`);
      await User.update(
        {
          _id: id,
        },
        {
          picture: data.Location,
        },
      );
      logger.info(`Picture updated successfully`);
      const user = await User.findOne({ _id: id });
      return res.status(200).json({
        message: 'User display successfully updated',
        data: user,
      });
    } catch (error) {
      logger.error(JSON.stringify((error = error.stack)));
      return null;
    }
  });
};
