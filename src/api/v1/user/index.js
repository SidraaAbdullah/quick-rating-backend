const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const UploadImage = require(appRoot + '/src/util/s3-upload');
const usersMiddleWare = require(appRoot + '/src/middlewares/validations/user');

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/google-signup', userController.googleSignup);
router.post('/add-to-waiters', userController.addUserToWaitersList);
router.put(
  '/change-display/:id',
  [UploadImage.upload, usersMiddleWare.validateUserByParams],
  userController.changeUserDisplay,
);

router.patch('/:id', usersMiddleWare.validateUserByParams, userController.patchUpdateUser);

module.exports = router;
