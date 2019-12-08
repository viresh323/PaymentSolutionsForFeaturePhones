const httpStatus = require('http-status');
const { omit } = require('lodash');
const Transaction = require('../models/transaction.model');
const Customer = require('../models/customer.model');
const paymentService = require('../services/paymentService');
const withdrawalService = require('../services/withdrawalService');
const otpService = require('../services/otpService');
const transferService = require('../services/transferService');
const { handler: errorHandler } = require('../middlewares/error');


/**
 * Get customer balance
 * @public
 */
exports.getBalance = (req, res) => res.json(req.customer.transformBalance());

/**
 * Get customer transactions
 * @public
 */
exports.getTransactions = async (req, res, next) => {
	try {
		req.query.accountNumber = req.customer.accountNumber;
		const transactions = await Transaction.list(req.query);
		const transformedTransactions = transactions.map(transaction => transaction.transform());
		res.json(transformedTransactions);
	} catch (error) {
		next(error);
	}
};

/**
 * eWallet Deposit
 * @public
 */
exports.deposit = async (req, res, next) => {
	try {
		const paymentResponse = await paymentService.debitCard(req.customer.accountNumber, req.body.card, req.body.amount);
		res.json(paymentResponse);

	} catch (error) {
		next(error);
	}
};

/**
 * eWallet Transfer
 * @public
 */
exports.transfer = async (req, res, next) => {
	try {
		const transferResponse = await transferService.transfer(req.customer, req.customer.accountNumber, req.body.amount, req.body.destinationAccountNumber, req.body.purpose, req.body.secretKey);
		res.json(transferResponse);
	} catch (error) {
		next(error);
	}
};

/**
 * eWallet Withdrawal
 * @public
 */
exports.withdrawal = async (req, res, next) => {
	try {
		const withdrawalResponse = await withdrawalService.withdrawal(req.customer.accountNumber, req.body.card, req.body.amount);
		res.json(withdrawalResponse);
	} catch (error) {
		next(error);
	}
};

/**
 * Request OTP for receiving money.
 * @public
 */
exports.requestOtp = async (req, res, next) => {
	try {
		const mobileNumber = req.body.mobileNumber;
		const otpResponse = await otpService.requestOtp(req.customer, mobileNumber, req.body.amount);
		res.json(otpResponse);
	} catch (error) {
		next(error);
	}
};

/**
 * Request for receiving money.
 * @public
 */
exports.receiveAmt = async (req, res, next) => {
	try {
		const mobileNumber = req.body.mobileNumber;
		const amount = req.body.amount;
		const otp = req.body.otp;
		const otpResponse = await otpService.verifyOtp(req.customer, mobileNumber, req.body.amount, req.body.otp);
		if (otpResponse != null) {
			const offlineCustomer = await Customer.findOne({'mobileNumber': mobileNumber});
			if (offlineCustomer == null) {
				return reject("Transferring Customer Account not found.");
			} else if (offlineCustomer.balance < amount) {
				return reject("Insufficient balance.");
			} else {
				await transferService.transfer(offlineCustomer, offlineCustomer.accountNumber, amount, req.customer.accountNumber, "No Internet Portal Transfer", offlineCustomer.secretKey);
				return res.json({
					"success": true,
					"message": "Transfer Successfull",
					"data": "Transfer Successfull"
				});
			}
		}
		res.json(otpResponse);
	} catch (error) {
		next(error);
	}
};