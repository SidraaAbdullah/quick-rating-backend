const express = require('express');
const appRoot = require('app-root-path');
const router = express.Router();
const waitersJobFormController = require('./waiters-job-form.controller');
const usersMiddleWare = require(appRoot + '/src/middlewares/validations/user');
const waiterFormsMiddleWare = require(appRoot + '/src/middlewares/validations/waiter-form');

const auth = require(appRoot + '/src/middlewares/index');

router.post('/update-list', [auth], waitersJobFormController.updateFormListForManager);
router.post(
  '/:id',
  [usersMiddleWare.validateUserByParams],
  waitersJobFormController.createWaiterJobForm,
);
router.get('/', waitersJobFormController.getWaitersJobForms);
router.delete(
  '/',
  [waiterFormsMiddleWare.validateWaiterFormByIds],
  waitersJobFormController.deleteWaitersJobForms,
);

module.exports = router;
