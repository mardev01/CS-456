const tripsEndpoint = 'http://localhost:3000/api/trips';

const travel = async function (req, res, next) {
    try {
        const response = await fetch(tripsEndpoint, {
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
            throw new Error(
                `Trips API returned status ${response.status}`
            );
        }

        const trips = await response.json();

        if (!Array.isArray(trips)) {
            throw new Error('Trips API returned unexpected data');
        }

        res.render('travel', {
            title: 'Travlr Getaways',
            trips
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { travel };
