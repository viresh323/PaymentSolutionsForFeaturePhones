const httpStatus = require('http-status');
const { omit } = require('lodash');
const Customer = require('../models/customer.model');

const transferService = require('../services/transferService');

const GatewayTransaction = require('../models/gatewayTransaction.model');
const Transaction = require('../models/transaction.model');

const { handler: errorHandler } = require('../middlewares/error');

/**
 * Load customer and append to req.
 * @public
 */
exports.load = async (req, res, next, id) => {
	try {
		const customer = await Customer.get(id);
		req.locals = { customer };
		return next();
	} catch (error) {
		return errorHandler(error, req, res);
	}
};

/**
 * Get customer
 * @public
 */
exports.get = (req, res) => res.json(req.locals.customer.transform());

/**
 * Get logged in customer info
 * @public
 */
exports.loggedIn = (req, res) => res.json(req.customer.transform());

/**
 * Create new customer
 * @public
 */
exports.create = async (req, res, next) => {
	try {
		const customer = new Customer(req.body);
		const savedCustomer = await customer.save();
		res.status(httpStatus.CREATED);
		res.json(savedCustomer.transform());
	} catch (error) {
		next(Customer.checkDuplicateEmail(error));
	}
};

/**
 * Check customer
 * @public
 */
exports.checkCustomer = async (req, res, next) => {
	try {
		//const customer = new Customer(req.body);
		const savedCustomer = await Customer.findOne({ 'mobileNumber': req.body.mobileNumber }).exec();
		if (savedCustomer != null && savedCustomer.secretKey == req.body.secretKey) {
			res.json({
				status: "true"
			});
		}
		else {
			res.json({
				status: "false"
			});
		}
	} catch (error) {
		next(Customer.checkDuplicateEmail(error));
	}
};

/**
 * Check Balance
 * @public
 */
exports.checkBalance = async (req, res, next) => {
	try {
		//const customer = new Customer(req.body);
		const savedCustomer = await Customer.findOne({ 'mobileNumber': req.body.mobileNumber }).exec();
		if (savedCustomer != null) {
			res.json({
				balance: savedCustomer.balance
			});
		}
		else {
			res.json({
				status: "false"
			});
		}
	} catch (error) {
		next(Customer.checkDuplicateEmail(error));
	}
};


/**
 * Transfer Amount
 * @public
 */
exports.transferAmount = async (req, res, next) => {
	try {
		const savedCustomer = await Customer.findOne({ 'mobileNumber': req.body.mobileNumber }).exec();
		if (savedCustomer == null) {
			return res.json({
				"responseCode" : 51,
				"message": "Customer with said mobile number not found."
			});
		}
		if (req.body.mobileNumber == req.body.destinationMobileNumber) {
			return res.json({
				"responseCode" : 52,
				"message": "Transferring to same account is not allowed."
			});
		}

		if (savedCustomer.balance > req.body.amount) {
			const transferableCustomerAcc = await Customer.findOne({ 'mobileNumber': req.body.destinationMobileNumber });
			if (transferableCustomerAcc == null) {
				return res.json({
					"responseCode" : 53,
					"message": "Account with Destination Mobile Number not found."
				});
			}

			const transferResponse = await transferService.transfer(savedCustomer, savedCustomer.accountNumber, req.body.amount, transferableCustomerAcc.accountNumber, "IVR Transfer", savedCustomer.secretKey);
			return res.json({
				"responseCode": 55,
				"message": "Transfer successfull",
				"data": transferResponse
			});
		} else {
			res.json({
				"responseCode" : 51,
				"message": "Insufficient balance to make the transaction."
			});
		}
	} catch (error) {
		next(error);
	}
};

/**
 * Replace existing customer
 * @public
 */
exports.replace = async (req, res, next) => {
	try {
		const { customer } = req.locals;
		const newCustomer = new Customer(req.body);
		const ommitRole = customer.role !== 'admin' ? 'role' : '';
		const newCustomerObject = omit(newCustomer.toObject(), '_id', ommitRole);

		await customer.update(newCustomerObject, { override: true, upsert: true });
		const savedCustomer = await Customer.findById(customer._id);

		res.json(savedCustomer.transform());
	} catch (error) {
		next(Customer.checkDuplicateEmail(error));
	}
};

/**
 * Update existing customer
 * @public
 */
exports.update = (req, res, next) => {
	const ommitRole = req.locals.customer.role !== 'admin' ? 'role' : '';
	const updatedCustomer = omit(req.body, ommitRole);
	const customer = Object.assign(req.locals.customer, updatedCustomer);

	customer.save()
		.then(savedCustomer => res.json(savedCustomer.transform()))
		.catch(e => next(Customer.checkDuplicateEmail(e)));
};

/**
 * Get customer list
 * @public
 */
exports.list = async (req, res, next) => {
	try {
		const customers = await Customer.list(req.query);
		const transformedCustomers = customers.map(customer => customer.transform());
		res.json(transformedCustomers);
	} catch (error) {
		next(error);
	}
};

/**
 * Delete customer
 * @public
 */
exports.remove = (req, res, next) => {
	const { customer } = req.locals;

	customer.remove()
		.then(() => res.status(httpStatus.NO_CONTENT).end())
		.catch(e => next(e));
};
