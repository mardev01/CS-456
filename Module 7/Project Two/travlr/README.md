# Travlr Getaways

This is my CS 465 full stack project. I used Express and Handlebars for the customer website, Angular for the admin app, and MongoDB to store the data. Both sides connect through a REST API. Customers can search trips, create an account, and save reservations. Staff can sign in to manage trips and bookings.

## Local setup

This course version uses Node 20.20.2, npm, and Angular 17. Start MongoDB locally on port 27017 before running the app.

### 1. Install the backend packages

Open a terminal in this `travlr` folder and run:

```sh
npm ci
```

### 2. Set up the environment file

Copy `.env.example` to `.env`:

```sh
# macOS
cp .env.example .env
```

On Windows, use `copy .env.example .env` instead. Generate a secret with:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Paste the result after `JWT_SECRET=` in `.env`. Keep this file private. Update `DB_HOST` if your MongoDB connection uses a different address.

### 3. Add sample data and create a staff account

```sh
npm run seed
npm run create-admin
npm start
```

The seed command adds missing sample trips and keeps existing trips. Follow the prompts to create a staff account with a password between 12 and 128 characters.

The customer website runs at `http://localhost:3000`. Open `http://localhost:3000/travel` to view trips.

### 4. Start the admin app

In another terminal, open the same `travlr` folder and run:

```sh
cd app_admin
npm ci
npm start
```

Open `http://localhost:4200` and sign in with the staff account you created.

## Project folders

| Folder | What it contains |
| --- | --- |
| `app_server` | Customer routes, controllers, and Handlebars pages. |
| `app_api` | API routes, validation, authentication, and database models. |
| `app_admin/src/app` | Angular screens, reusable trip cards, forms, and services. |
| `public` | Website images, styles, and static pages. |
| `data/trips.json` | Sample trip data. |
| `testing/final` | Tests, screenshots, saved results, and Postman files. |

## How the app works

Customers can search by trip name, resort, or price. To reserve a trip, they open its details, choose **Reserve This Trip**, and sign in or create an account. Checkout supports 1 to 10 travelers. Customers can review their itinerary and cancel a future reservation. The original 2021 trips are examples; a reservation requires a future departure date. The app does not collect payments.

Staff use the Angular app to add, edit, or delete trips. They can also manage reservations, disable or reactivate customer accounts, and change their own display name. Customer and staff accounts are separate. Password recovery, payments, flights, cruises, memberships, and rewards are not included.

## API and security

Anyone can retrieve trips with GET `/api/trips` or GET `/api/trips/:tripCode`. Adding, updating, and deleting trips requires a staff account and a valid Bearer token. POST `/api/login` returns a token that lasts one hour. Staff registration is restricted to existing staff. The `create-admin` command can also create a staff account locally.

Passwords are salted and hashed with PBKDF2. The server checks the token and staff account before allowing protected requests. Angular stores the staff token in sessionStorage and removes it on sign-out. An issued token can still work until it expires unless the staff account is removed.

The server checks trip fields, prices, image paths, and duplicate trip codes. Customer pages use HttpOnly, SameSite cookies and CSRF protection. The backend calculates reservation prices from saved trip data, rejects past departures, and prevents duplicate checkout submissions. Existing reservations keep their booked details when a trip changes.

This is a local course project. Before public hosting, update the course framework and runtime, use HTTPS, and configure production secrets and allowed origins. The saved Angular dependency report is in `testing/final/angular-audit.json`.

## Testing

With MongoDB running, run the backend tests from this `travlr` folder:

```sh
npm test
```

The tests create and remove separate temporary databases named with `travlr_test_` or `travlr_customer_test_`. They keep the regular `travlr` database unchanged.

For Angular, open `app_admin` and run these commands with Google Chrome installed:

```sh
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

For Postman, import the collection and environment from `testing/final`. Enter your local staff email and password, then run the requests in order. The collection creates, updates, and deletes the `FINALPOSTMAN` test trip, so keep that code reserved for testing.

The saved results show 17 backend tests, seven Angular tests, and 25 Newman assertions across 11 requests passing. These are the earlier project results; the tests were not rerun for this README update. Screenshots cover staff login, trip updates, customer accounts, checkout, itineraries, and staff management.

## Included files

The project includes source code, package lockfiles, sample data, setup instructions, and testing evidence. Installed packages, build output, private `.env` files, and login credentials are excluded. Install the packages and create your own secret and staff account when setting it up.

## References

- [Passport password authentication](https://www.passportjs.org/concepts/authentication/password/)
- [Angular HTTP interceptors](https://angular.dev/guide/http/interceptors)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
