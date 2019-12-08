const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/customer.controller');
const {
	listCustomers,
	createCustomer,
	replaceCustomer,
	updateCustomer,
} = require('../../validations/customer.validation');

const router = express.Router();

/**
 * Load customer when API with customerId route parameter is hit
 */
router.param('customerId', controller.load);


router
	.route('/authorize')
    .post(controller.checkCustomer);

router
	.route('/wallet/balance')
	.post(controller.checkBalance);

router
	.route('/wallet/transfer')
	.post(controller.transferAmount);



module.exports = router;
