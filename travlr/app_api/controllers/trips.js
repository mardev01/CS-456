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

module.exports = {
    tripsList,
    tripsFindByCode
};