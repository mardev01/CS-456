const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jwtSecret } = require('../config/environment');
async function authenticateJWT(req, res, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
  if (!match) return res.status(401).json({ message: 'Sign in to manage trips.' });
  let payload;
  try {
    payload = jwt.verify(match[1], jwtSecret, {
      algorithms: ['HS256'], issuer: 'travlr', audience: 'travlr-admin'
    });
    if (typeof payload.sub !== 'string' || !/^[a-f0-9]{24}$/i.test(payload.sub)) throw new Error('Invalid subject');
  } catch (error) { return res.status(401).json({ message: 'Your session is invalid or expired. Sign in again.' }); }
  try {
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Sign in again.' });
    req.auth = { id: user.id, email: user.email, name: user.name };
    return next();
  } catch (error) { return next(error); }
}
module.exports = { authenticateJWT };
