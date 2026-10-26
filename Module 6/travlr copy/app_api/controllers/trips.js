const Trip = require('../models/travlr');

const tripsList = async function (req, res) {
    try {
        const trips = await Trip.find({}).exec();
        return res.status(200).json(trips);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const tripsFindByCode = async function (req, res) {
    try {
        const trips = await Trip.find({
            code: req.params.tripCode
        }).exec();

        if (trips.length === 0) {
            return res.status(404).json({
                message: 'Trip not found'
            });
        }

        return res.status(200).json(trips);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const tripsAddTrip = async function(req, res) {
    try {
        const fields = ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'];
        const body = req.body || {};
        const tripData = Object.fromEntries(fields.map(field => [field, body[field]]));
        const trip = new Trip(tripData);
        await trip.validate();
        if (await Trip.exists({ code: trip.code })) {
            return res.status(409).json({ message: 'A trip with this code already exists' });
        }
        await trip.save();
        return res.status(201).json(trip);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
};

const tripsUpdateTrip = async function(req, res) {
    try {
        const tripCode = req.params.tripCode;
        if (!await Trip.exists({ code: tripCode })) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        const fields = ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'];
        const body = req.body || {};
        if (body.code !== tripCode) {
            return res.status(400).json({ message: 'Trip code must match the existing trip' });
        }
        const tripData = Object.fromEntries(fields.map(field => [field, body[field]]));
        await new Trip(tripData).validate();
        const trip = await Trip.findOneAndUpdate(
            { code: tripCode }, { $set: tripData }, { new: true, runValidators: true }
        ).exec();
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        return res.status(200).json(trip);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { tripsList, tripsFindByCode, tripsAddTrip, tripsUpdateTrip };
