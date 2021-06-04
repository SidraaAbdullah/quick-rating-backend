const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const userPaymentController = require('./user-payment.controller');
const usersMiddleWare = require(appRoot + '/src/middlewares/validations/user');

router.post('/card', [usersMiddleWare.validateUserByParams], userPaymentController.addCustomerCard);

module.exports = router;
