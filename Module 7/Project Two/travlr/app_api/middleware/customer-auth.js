const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');
const { jwtSecret } = require('../config/environment');
async function authenticateCustomer(req, res, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
  let payload;
  try {
    if (!match) throw new Error('Missing token');
    payload = jwt.verify(match[1], jwtSecret, { algorithms: ['HS256'], issuer: 'travlr', audience: 'travlr-customer' });
    if (typeof payload.sub !== 'string' || !/^[a-f0-9]{24}$/i.test(payload.sub)) throw new Error('Invalid subject');
  } catch { return res.status(401).json({ message: 'Sign in to your customer account.' }); }
  try {
    const customer = await Customer.findOne({ _id: payload.sub, active: true });
    if (!customer) return res.status(401).json({ message: 'This account is unavailable. Contact Travlr for help.' });
    req.customer = customer;
    next();
  } catch (error) { next(error); }
}
module.exports = { authenticateCustomer };
