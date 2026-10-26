const Customer = require('../models/customer');
const User = require('../models/user');
const summary = user => ({ _id: user.id, name: user.name, email: user.email, active: user.active, createdAt: user.createdAt });
const register = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || name.length > 100 || typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254 || typeof password !== 'string' ||
      password.length < 12 || password.length > 128 || password !== confirmPassword) {
    return res.status(400).json({ message: 'Enter your name, a valid email, and matching passwords of 12 to 128 characters.' });
  }
  try {
    await Customer.init();
    const customer = new Customer({ name, email });
    await customer.setPassword(password); await customer.save();
    res.set('Cache-Control','no-store');
    return res.status(201).json({ token: customer.generateJWT(), customer: summary(customer) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    throw error;
  }
};
const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password || email.length > 254 || password.length > 128) {
    return res.status(400).json({ message: 'Enter your email and password.' });
  }
  const customer = await Customer.findOne({ email: email.trim().toLowerCase(), active: true }).select('+hash +salt');
  if (!customer || !await customer.validPassword(password)) return res.status(401).json({ message: 'Email or password is incorrect.' });
  res.set('Cache-Control','no-store');
  return res.json({ token: customer.generateJWT(), customer: summary(customer) });
};
const me = (req, res) => res.json(summary(req.customer));
const list = async (req, res) => res.json((await Customer.find({}).sort({ name: 1 })).map(summary));
const update = async (req, res) => {
  if (!/^[a-f0-9]{24}$/i.test(req.params.customerId)) return res.status(404).json({ message: 'Customer not found.' });
  if (typeof req.body.active !== 'boolean') return res.status(400).json({ message: 'Choose whether the account is active.' });
  const customer = await Customer.findByIdAndUpdate(req.params.customerId, { $set: { active: req.body.active } }, { returnDocument:'after',runValidators:true });
  if (!customer) return res.status(404).json({ message: 'Customer not found.' });
  res.json(summary(customer));
};
const staffMe = (req,res) => res.json(req.auth);
const staffUpdate = async (req,res) => {
  if (typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.length > 100) return res.status(400).json({ message:'Enter a name of 1 to 100 characters.' });
  const user=await User.findByIdAndUpdate(req.auth.id,{$set:{name:req.body.name.trim()}},{returnDocument:'after',runValidators:true});
  res.json({ name:user.name,email:user.email,token:user.generateJWT() });
};
module.exports = { register,login,me,list,update,staffMe,staffUpdate };
