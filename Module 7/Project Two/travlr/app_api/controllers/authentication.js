const passport = require('passport');
const User = require('../models/user');
const validCredentials = body => typeof body.email === 'string' &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()) && body.email.length <= 254 &&
  typeof body.password === 'string' && body.password.length >= 12 && body.password.length <= 128;
const register = async (req, res) => {
  const body = req.body || {};
  if (!validCredentials(body) || typeof body.name !== 'string' || !body.name.trim() || body.name.length > 100) {
    return res.status(400).json({ message: 'Enter a name, valid email, and password of 12 to 128 characters.' });
  }
  try {
    const user = new User({ name: body.name, email: body.email });
    await user.setPassword(body.password);
    await user.save();
    return res.status(201).json({ token: user.generateJWT() });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    if (error.name === 'ValidationError') return res.status(400).json({ message: 'Enter valid account details.' });
    return res.status(500).json({ message: 'Account could not be created.' });
  }
};
const login = (req, res, next) => {
  const body = req.body || {};
  if (typeof body.email !== 'string' || typeof body.password !== 'string' ||
      body.email.length > 254 || body.password.length > 128 || !body.email || !body.password) {
    return res.status(400).json({ message: 'Enter your email and password.' });
  }
  return passport.authenticate('local', { session: false }, (error, user) => {
    if (error) return next(error);
    if (!user) return res.status(401).json({ message: 'Email or password is incorrect.' });
    return res.status(200).json({ token: user.generateJWT() });
  })(req, res, next);
};
module.exports = { login, register };
