/* GET travel view */
const travel = (req, res) => {
    var fs = require('fs');
    var trips = JSON.parse(fs.readFileSync('./data/trips.json', 'utf8'));

    res.render('travel', {
        title: 'Travlr Getaways',
        trips
    });
};

module.exports = {
    travel
};