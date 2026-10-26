# Travlr Getaways

CS 465 MEAN stack course project. Express and Handlebars serve the customer site. Angular provides the staff SPA, and both use MongoDB through the REST API. Customers can create accounts, search trips, save reservations, and view their itineraries.

## Local setup

Use Node 20.20.2 and npm for the Angular 17 course version. MongoDB must run locally on port 27017. On this Mac, Node 20 is available at `/opt/homebrew/opt/node@20/bin`.

From the `travlr` folder:

```sh
npm ci
```

Copy `.env.example` to `.env` (macOS: `cp .env.example .env`; Windows: `copy .env.example .env`). Generate a secret and paste its output after `JWT_SECRET=` in `.env`:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Keep `.env` private. Set `DB_HOST` if your MongoDB connection differs from the local default.

```sh
npm run seed
npm run create-admin
npm start
```

The seed command adds missing examples without deleting or replacing existing trips. Create your first staff account using the interactive command; passwords must have 12 to 128 characters. Existing accounts are kept. The customer site runs at http://localhost:3000, and its dynamic trip page is http://localhost:3000/travel.

In a separate terminal:

```sh
cd app_admin
npm ci
npm start
```

Open http://localhost:4200 and sign in with your staff account. On the development Mac only, the separate `Admin Login.txt` beside the project contains the local demonstration account. It is not in the ZIP and is not needed on another machine.

## Application structure

- `app_server`: Express customer routes, controllers, and Handlebars views.
- `app_api`: trip, staff, customer, and reservation routes, controllers, middleware, and Mongoose models.
- `app_admin/src/app`: Angular trip listing, reusable cards, forms, login, data service, guard, interceptor, and staff customer/reservation/settings screens.
- `public`: customer website images, styles, and static pages.
- `data/trips.json`: sample trips, including the added Coral Cove and Sunset Cove examples.
- `testing/final`: automated tests, final browser screenshots, test logs, and an importable Postman collection.

## Security and API

GET `/api/trips` and GET `/api/trips/:tripCode` are public. POST, PUT, and DELETE require an existing staff account and a verified Bearer token. `/api/login` issues a one-hour JWT. `/api/register` is restricted to existing staff; there is no public administrator signup. To add another staff member, use the local create-admin command or authenticated registration API.

Passwords use random salts and PBKDF2 hashes. The server checks token signature, issuer, audience, expiration, and the staff account on protected calls. Angular uses tab-scoped sessionStorage; sign out removes its token. Already-issued tokens remain valid until expiry unless their staff account is removed. Server validation rejects missing fields, negative or invalid prices, changed trip codes, invalid image paths, and duplicate trip codes. Descriptions escape markup and allow only basic formatting tags with no attributes.

This is a local course build. Angular 17 and Node 20 are retained for the course and require an upgrade before production; see `testing/final/angular-audit.json`. Use HTTPS, deployment-specific origins and secrets, and a supported framework/runtime before hosting publicly.

## Customer and staff workflows

On the customer Travel page, search by trip or resort name and minimum/maximum price. Open a trip, choose Reserve This Trip, and create a customer account or sign in. Checkout returns after sign in, calculates the total for 1 to 10 travelers, and saves the reservation. Reservations appears in the header only when signed in. Open an itinerary to review its saved details or cancel a future reservation. No online payment is collected. The three original 2021 trips remain as course examples; Coral Cove and Sunset Cove have future dates and can be reserved.

Customer accounts and staff accounts are separate. Customer tokens cannot authorize staff actions. The Express customer pages use HttpOnly, SameSite cookies and signed CSRF form tokens; staff Angular tokens remain in sessionStorage. The API derives the price from the saved trip, rejects past departures, and uses a checkout request key to avoid duplicate reservations when a form is submitted again. A reservation keeps its booked details and price even if the trip later changes.

The Angular sidebar has Travel, Reservations, Users, and Settings. Staff can search bookings, confirm or cancel them, disable/reactivate customer accounts without deleting reservations, and update their own display name. Password recovery, payments, flight/cruise integrations, memberships, and rewards are not implemented. The wireframe guides navigation and screen organization; the course trip cards and existing theme are retained.

## Verification

Run the API tests while MongoDB is available:

```sh
npm test
```

They use a separate temporary `travlr_test_` or `travlr_customer_test_` database, create their own records, and remove that database afterward. They do not reset the regular `travlr` database.

Run Angular tests from `app_admin` with Google Chrome installed:

```sh
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

For Postman, import the collection and environment from `testing/final`. Fill in the environment email and password for your local staff account. Run the collection in order. It creates, updates, and deletes only its `FINALPOSTMAN` test trip; use that code only for this test workflow. The supplied run log was generated by Newman, Postman's collection runner, with 11 requests and 25 passing assertions. API tests passed 17 tests and Angular tests passed seven tests.

Browser screenshots show staff sign in, trip validation/listing/edit/update, customer signup and account creation, search, checkout, saved itinerary, and staff management. The browser-check account and reservation were temporary test fixtures and are removed after evidence capture. GET and PUT were also checked directly in MongoDB and on the customer Travel page. Test logs distinguish these current checks from historical Module Six screenshots.

## Submission contents

The ZIP includes source, package lockfiles, seed examples, setup notes, and testing evidence. It excludes node_modules, .angular, dist, .git, .env, and local login credentials. Reinstall packages and create a fresh secret and administrator after extracting it.

Implementation references: [Passport password authentication](https://www.passportjs.org/concepts/authentication/password/), [Angular HTTP interceptors](https://angular.dev/guide/http/interceptors), and [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken).
