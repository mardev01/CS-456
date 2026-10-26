const mongoose = require('mongoose');
const snapshot = new mongoose.Schema({
  code: { type: String, required: true }, name: { type: String, required: true },
  length: { type: String, required: true }, start: { type: Date, required: true },
  resort: { type: String, required: true }, image: { type: String, required: true }
}, { _id: false });
const schema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers', required: true, index: true },
  reference: { type: String, required: true, unique: true },
  requestKey: { type: String, required: true },
  trip: { type: snapshot, required: true },
  travelers: { type: Number, required: true, min: 1, max: 10, validate: Number.isInteger },
  pricePerPersonCents: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  totalCents: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  status: { type: String, enum: ['confirmed','cancelled'], default: 'confirmed' }
}, { timestamps: true });
schema.index({ customer: 1, requestKey: 1 }, { unique: true });
module.exports = mongoose.model('reservations', schema);
