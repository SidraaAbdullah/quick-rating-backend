const express = require('express');
const appRoot = require('app-root-path');
const router = express.Router();
const staffController = require('./staff.controller');
const auth = require(appRoot + '/src/middlewares/index');

router.post('/', [auth], staffController.createStaff);

router.get('/', [auth], staffController.getStaffs);

module.exports = router;
