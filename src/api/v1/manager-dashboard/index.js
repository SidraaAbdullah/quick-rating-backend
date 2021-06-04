const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const managerController = require('./manager-dashboard.controller');
const usersMiddleWare = require(appRoot + '/src/middlewares/validations/user');

router.post('/signin', managerController.signIn);
router.post('/signup', managerController.signUp);
router.get('/', managerController.getAllManagers);

module.exports = router;
