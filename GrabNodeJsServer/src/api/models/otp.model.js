const mongoose = require('mongoose');
const mongooseBD = require('../../config/mongoose');
const autoIncrement = require('../services/mongooseAutoIncrement');

autoIncrement.initialize(mongooseBD.connect());

/**
 * Otp Schema
 * @private
 */
const otpSchema = new mongoose.Schema({
	sendersMobileNumber: {
		type: String,
		unique: true,
		required: false
	},
	destinationMobileNumber: {
		type: String,
		unique: true,
		required: false
	},
	otp: {
		type: Number,
		unique: true,
		required: false
	},
	amount: {
		type: Number,
		unique: true,
		required: false
	}
}, {
	timestamps: true,
});




/**
 * @typedef Otp
 */
module.exports = mongoose.model('Otp', otpSchema);
