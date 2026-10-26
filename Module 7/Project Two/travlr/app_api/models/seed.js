require('../config/environment');
const fs = require('fs');
const path = require('path');
const { mongoose, connect } = require('./db');
const Trip = require('./travlr');
async function seed() {
  try {
    const trips = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'trips.json'), 'utf8'));
    await connect();
    for (const trip of trips) {
      await new Trip(trip).validate();
      await Trip.updateOne({ code: trip.code }, { $setOnInsert: trip }, { upsert: true });
    }
    console.log('Seed trips added where missing. Existing trips were kept.');
  } catch (error) { console.error('Seeding failed:', error.message); process.exitCode = 1; }
  finally { await mongoose.disconnect(); }
}
seed();
