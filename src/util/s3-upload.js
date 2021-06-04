const multer = require('multer');
const appRoot = require('app-root-path');
const AWS = require('aws-sdk');
const config = require('config');
const { v4: uuidv4 } = require('uuid');
const Aws = config.get('aws');
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

exports.upload = multer({ storage }).single('image'); // image will be use as a key whenever we upload a file


const params = (buffer, path) => {
	const params = {
		Bucket: Aws.bucketName,
		Key: `${path}/${uuidv4()}.jpg`, // random string with fileType
		Body: buffer,
	};
	return params;
};

exports.uploadFile = async (buffer, path) => {
	const param = params(buffer, path)
	return new Promise(async function (resolve, reject) {
		await s3.upload(param, function (s3Err, data) {
			if (s3Err) {
				reject(s3Err);
			}
			logger.info(`File uploaded successfully at ${data?.Location}`);
			resolve(data?.Location);
		});
	});
};
