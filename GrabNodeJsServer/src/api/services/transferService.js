const uuidv4 = require('uuid/v4');
const crypto = require('crypto');
const moment = require('moment-timezone');
const GatewayTransaction = require('../models/gatewayTransaction.model');
const APIError = require('../utils/APIError');
const httpStatus = require('http-status');
const Customer = require('../models/customer.model');
const Transaction = require('../models/transaction.model');

exports.transfer = async (customer, accountNumber, amount, destinationAccountNumber, purpose, secretKey) => {
	const reference = uuidv4();

	if (customer.secretKey != secretKey) {
		throw new Error("Wrong SecretKey");
	}

	if (customer.balance < amount) {
		throw new Error("Insufficient Balance.");
	}

	const transferableCustomerAcc = await Customer.findOne({ 'accountNumber': destinationAccountNumber });
	if (transferableCustomerAcc == null) {
		throw new Error("Destination account not found.");
	}

	if (accountNumber == destinationAccountNumber) {
		throw new Error("Cannot transfer funds to the same account.");
	}

	const transaction = new Transaction();
	transaction.amount = -amount;
	transaction.operation = 'transfer';
	transaction.accountNumber = accountNumber;
	transaction.destinationAccountNumber = destinationAccountNumber;
	transaction.purpose = purpose;
	transaction.reference = 'transfer_to_account:' + destinationAccountNumber;
	const savedTransaction = await transaction.save();
	const savedCustomer = await Customer.findOne({ 'accountNumber': accountNumber });

	const transactionBeneficiary = new Transaction();
	transactionBeneficiary.amount = amount;
	transactionBeneficiary.operation = 'transfer';
	transactionBeneficiary.accountNumber = destinationAccountNumber;
	transaction.purpose = purpose;
	transactionBeneficiary.reference = 'transfer_from_account:' + accountNumber;
	const savedTransactionBeneficiary = await transactionBeneficiary.save();

	const response = { transaction: transaction.transform(), customer: savedCustomer.transformBalance() }

	return response;
};