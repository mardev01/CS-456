const mongoose = require('mongoose');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/environment');
const pbkdf2 = promisify(crypto.pbkdf2);
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  hash: { type: String, required: true, select: false },
  salt: { type: String, required: true, select: false }
});
userSchema.methods.setPassword = async function(password) {
  this.salt = crypto.randomBytes(32).toString('hex');
  this.hash = (await pbkdf2(password, this.salt, 310000, 32, 'sha256')).toString('hex');
};
userSchema.methods.validPassword = async function(password) {
  const actual = await pbkdf2(password, this.salt, 310000, 32, 'sha256');
  return crypto.timingSafeEqual(actual, Buffer.from(this.hash, 'hex'));
};
userSchema.methods.generateJWT = function() {
  return jwt.sign({ name: this.name, email: this.email }, jwtSecret,
    { subject: this.id, expiresIn: '1h', algorithm: 'HS256', issuer: 'travlr', audience: 'travlr-admin' });
};
module.exports = mongoose.model('users', userSchema);
