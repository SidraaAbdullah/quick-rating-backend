const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const waitersController = require('./waiters.controller');
const validateWaiter = require(appRoot + '/src/middlewares/validations/waiter');

router.get('/', waitersController.getRestaurantWaiters);
router.patch('/:id', [validateWaiter.validateWaiterByParams], waitersController.waiterUpdate);
router.post('/', waitersController.addRestaurantWaiters);
router.delete('/:id', [validateWaiter.validateWaiterByParams], waitersController.deleteRestaurantWaiter);
router.post('/bulk-delete', waitersController.deleteBulkRestaurantWaiter);


module.exports = router;
