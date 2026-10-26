const express = require('express');
const { rateLimit } = require('express-rate-limit');
const router = express.Router();
const trips = require('../controllers/trips');
const authentication = require('../controllers/authentication');
const { authenticateJWT } = require('../middleware/auth');
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20,
  standardHeaders: 'draft-7', legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Try again later.' } });
router.post('/login', loginLimit, authentication.login);
// Only an existing administrator may create another staff account.
router.post('/register', authenticateJWT, authentication.register);
router.get('/trips', trips.tripsList);
router.get('/trips/:tripCode', trips.tripsFindByCode);
router.post('/trips', authenticateJWT, trips.tripsAddTrip);
router.put('/trips/:tripCode', authenticateJWT, trips.tripsUpdateTrip);
router.delete('/trips/:tripCode', authenticateJWT, trips.tripsDeleteTrip);

const customers = require('../controllers/customers');
const reservations = require('../controllers/reservations');
const { authenticateCustomer } = require('../middleware/customer-auth');
const asyncRoute = handler => (req,res,next) => Promise.resolve(handler(req,res,next)).catch(next);
router.post('/customer/register', loginLimit, asyncRoute(customers.register));
router.post('/customer/login', loginLimit, asyncRoute(customers.login));
router.get('/customer/me', authenticateCustomer, customers.me);
router.get('/customer/reservations', authenticateCustomer, asyncRoute(reservations.listOwn));
router.post('/customer/reservations', authenticateCustomer, asyncRoute(reservations.create));
router.get('/customer/reservations/:reservationId', authenticateCustomer, asyncRoute(reservations.getOwn));
router.patch('/customer/reservations/:reservationId/cancel', authenticateCustomer, asyncRoute(reservations.cancelOwn));
router.get('/customers', authenticateJWT, asyncRoute(customers.list));
router.patch('/customers/:customerId', authenticateJWT, asyncRoute(customers.update));
router.get('/reservations', authenticateJWT, asyncRoute(reservations.listAll));
router.patch('/reservations/:reservationId', authenticateJWT, asyncRoute(reservations.update));
router.get('/staff/me', authenticateJWT, customers.staffMe);
router.put('/staff/me', authenticateJWT, asyncRoute(customers.staffUpdate));
module.exports = router;
