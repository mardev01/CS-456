const Trip = require('../models/travlr');
// Escape markup first, then allow only simple formatting tags without attributes.
const sanitizeDescription = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/&lt;(\/?)(p|br|strong|em|ul|ol|li)\s*\/?&gt;/gi, '<$1$2>');
const cleanTrip = body => {
    const fields = ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'];
    const data = Object.fromEntries(fields.map(field => [field, body[field]]));
    if (typeof data.description === 'string') data.description = sanitizeDescription(data.description);
    return data;
};

const tripsList = async function (req, res) {
    try {
        
const query=req.query;
        for(const key of ['q','minPrice','maxPrice']) if(query[key]!==undefined && typeof query[key]!=='string') return res.status(400).json({message:'Invalid search values.'});
        const q=(query.q||'').trim();
        const min=query.minPrice ? Number(query.minPrice) : 0;
        const max=query.maxPrice ? Number(query.maxPrice) : Infinity;
        if(q.length>80 || !Number.isFinite(min) || min<0 || Number.isNaN(max) || max<min || max<0) return res.status(400).json({message:'Enter a valid search and price range.'});
        let trips=await Trip.find({}).exec();
        trips=trips.filter(trip => (!q || `${trip.name} ${trip.resort}`.toLowerCase().includes(q.toLowerCase())) && Number(trip.perPerson)>=min && Number(trip.perPerson)<=max);
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
        const body = req.body || {};
        const tripData = cleanTrip(body);
        const trip = new Trip(tripData);
        await trip.validate();
        if (await Trip.exists({ code: trip.code })) {
            return res.status(409).json({ message: 'A trip with this code already exists' });
        }
        await trip.save();
        return res.status(201).json(trip);
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'A trip with this code already exists' });
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
        const body = req.body || {};
        if (body.code !== tripCode) {
            return res.status(400).json({ message: 'Trip code must match the existing trip' });
        }
        const tripData = cleanTrip(body);
        await new Trip(tripData).validate();
        const trip = await Trip.findOneAndUpdate(
            { code: tripCode }, { $set: tripData }, { returnDocument: 'after', runValidators: true }
        ).exec();
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        return res.status(200).json(trip);
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: 'A trip with this code already exists' });
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
};


const tripsDeleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findOneAndDelete({ code: req.params.tripCode }).exec();
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        return res.status(204).end();
    } catch (error) { return res.status(500).json({ message: 'Trip could not be deleted.' }); }
};
module.exports = { tripsList, tripsFindByCode, tripsAddTrip, tripsUpdateTrip, tripsDeleteTrip };
