const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./user');
const { jwtSecret } = require('../config/environment');
// Customers share password hashing rules, but never the staff collection or token audience.
const schema = User.schema.clone();
schema.add({ active: { type: Boolean, default: true }, createdAt: { type: Date, default: Date.now } });
schema.methods.generateJWT = function() {
  return jwt.sign({ name: this.name, email: this.email }, jwtSecret,
    { subject: this.id, expiresIn: '1h', algorithm: 'HS256', issuer: 'travlr', audience: 'travlr-customer' });
};
module.exports = mongoose.model('customers', schema);
