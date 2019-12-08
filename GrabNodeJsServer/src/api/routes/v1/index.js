const express = require('express');
const customerRoutes = require('./customer.route');
const phoneRoutes = require('./phone.route');
const walletRoutes = require('./ewallet.route');
const authRoutes = require('./auth.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/customers', customerRoutes);
router.use('/customers', phoneRoutes);
router.use('/ewallet', walletRoutes);
router.use('/auth', authRoutes);

module.exports = router;
