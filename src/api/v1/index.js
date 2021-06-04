const express = require('express');
const router = express.Router();
const path = require('path');
const users = require('./user');
const restaurants = require('./restaurants');
const waiters = require('./waiters');
const waitersVoting = require('./waiters-voting');
const dashboard = require('./dashboard');
const userPayment = require('./user-payment');
const waiterJobForm = require('./waiters-job-form');
const manager = require('./manager-dashboard');
const staff = require('./staff');

router.use('/users', users);
router.use('/restaurants', restaurants);
router.use('/waiters-voting', waitersVoting);
router.use('/restaurant-waiters', waiters);
router.use('/dashboard', dashboard);
router.use('/user-payments', userPayment);
router.use('/waiters-job-form', waiterJobForm);
router.use('/manager', manager);
router.use('/staff', staff);

module.exports = router;
