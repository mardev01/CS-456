const mongoose = require('mongoose');

const dbURI = process.env.DB_HOST || 'mongodb://127.0.0.1:27017/travlr';

mongoose.connection.on('connected', () => {
    console.log(`Mongoose connected to ${dbURI}`);
});
mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

const connect = () => mongoose.connect(dbURI);

module.exports = { mongoose, connect };