const fs = require('fs');
const path = require('path');
const { mongoose, connect } = require('./db');
const Trip = require('./travlr');

async function seed() {
    try {
        const file = path.join(__dirname, '..', '..', 'data', 'trips.json');
        const trips = JSON.parse(fs.readFileSync(file, 'utf8'));

        if (!Array.isArray(trips) || trips.length !== 3) {
            throw new Error('Expected an array of three trips in data/trips.json');
        }

        await connect();
        await Promise.all(trips.map((trip) => new Trip(trip).validate()));
        await Trip.deleteMany({});
        await Trip.insertMany(trips);
        console.log(`Loaded ${trips.length} trips`);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seed();