const mongoose = require('mongoose');
const tripSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true, maxlength: 40, match: /^[A-Za-z0-9_-]+$/ },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  length: { type: String, required: true, trim: true, maxlength: 100 },
  start: { type: Date, required: true },
  resort: { type: String, required: true, trim: true, maxlength: 200 },
  perPerson: { type: String, required: true, validate: value => /^\d+(\.\d{1,2})?$/.test(value) && Number.isFinite(Number(value)) },
  image: { type: String, required: true, match: /^[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/i },
  description: { type: String, required: true, maxlength: 5000 }
});
tripSchema.index({ code: 1 }, { unique: true, name: 'trip_code_unique' });
module.exports = mongoose.model('trips', tripSchema, 'trips');
