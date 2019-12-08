const request = require('request');

const Otp = require('../models/otp.model');

const Customer = require('../models/customer.model');

const accountSid = 'ACbfd3c47b93fbd25e40bb6839ac8a12e6';
const authToken = 'd0c3555dc7864546707997b53c1cca68';
const client = require('twilio')(accountSid, authToken);

let webhookUrl = 'https://enut4wi5yp2lc.x.pipedream.net';

exports.requestOtp = async (customerObj, mobileNumber, amount) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (customerObj.mobileNumber == mobileNumber) {
                return reject("Cannot initiate transfer to the same account.");
            }
            const randomOtp = Math.floor(100000 + Math.random() * 900000);
            const messageBody = customerObj.name + ' is requesting ' + amount + ' grabs. Please share the following OTP: ' + randomOtp + ' to authenticate transfer.';
            const customerAcc = await Customer.findOne({ 'mobileNumber': mobileNumber });
            if (customerAcc == null) {
                return reject("Customer with mobile number not found");
            }
            client.messages.create({
                body: messageBody,
                from: '+14848703414',
                to: mobileNumber
            }).then((message) => {
                webhookUrl = webhookUrl + '?message=' + messageBody;
                request({ method: 'GET', url: webhookUrl }, async function (error, response, body) {
                    const otpObj = await Otp.findOne({ 'sendersMobileNumber': customerObj.mobileNumber, 'destinationMobileNumber': mobileNumber });
                    if (otpObj == null) {
                        const saveOtp = new Otp();
                        saveOtp.sendersMobileNumber = customerObj.mobileNumber;
                        saveOtp.destinationMobileNumber = mobileNumber;
                        saveOtp.otp = randomOtp;
                        saveOtp.amount = amount;
                        await saveOtp.save();
                    } else {
                        await otpObj.update({
                            otp: randomOtp
                        });
                    }
                    return resolve(message);
                });
            }).catch((error) => {
                console.log(error);
                return reject(error);
            })
        } catch (error) {
            return reject(error);
        }
    });
}

/**
 * Verify transaction OTP.
 */
exports.verifyOtp = async (customerObj, mobileNumber, amount, otp) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (customerObj.mobileNumber == mobileNumber) {
                return reject("Cannot initiate transfer to the same account.");
            }

            const otpObj = await Otp.findOne({ 'sendersMobileNumber': customerObj.mobileNumber, 'destinationMobileNumber': mobileNumber, 'amount': amount, 'otp': otp });
            if (otpObj == null) {
                return reject("Authentication failed: Cannot initiate transfer")
            }
            return resolve(otpObj);

        } catch (error) {
            return reject(error);
        }
    });
}