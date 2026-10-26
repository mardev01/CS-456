# Travlr Getaways Portfolio

This is my full stack Travlr Getaways project. I kept each module's version to show how I built the application, from a basic customer website to a working app with a database, an admin interface, and secure login.

The final app is in [Module 7 → Project Two → travlr](Module%207/Project%20Two/travlr). My [Module Eight reflection](Module%208/Journal%20Reflection.md) is also included.

## Module organization

| Folder | Work included |
| --- | --- |
| [Module 1](Module%201) | Initial Express website and screenshot. |
| [Module 2](Module%202) | Customer site organized with routes, controllers, and Handlebars views. |
| [Module 3](Module%203) | Trip information loaded from JSON, testing notes, screenshot, and design document. |
| [Module 4](Module%204) | The application snapshot saved for this module. |
| [Module 5](Module%205) | MongoDB and REST API integration, plus the milestone design document. |
| [Module 6](Module%206) | Angular admin application, add/edit trip features, development screenshots, and a source-only ZIP. |
| [Module 7](Module%207) | Final application, security assignment snapshot, design document, and testing evidence. |
| [Module 8](Module%208) | Journal reflection in Markdown. |


Each module has its own application version and supporting files. The original root `travlr` folder and earlier branches are also kept. Dependencies and private environment files are excluded; they can be set up locally.

## Architecture

I used Express, HTML, and Handlebars for the customer website. Express builds the page on the server and sends it to the browser. JavaScript handles requests and works with the trip data. Shared headers and footers keep the pages consistent.

For the admin side, I used Angular and TypeScript to build a single-page application (SPA). It updates the screen through API requests without loading a whole new page each time. Both interfaces use the same backend data.

MongoDB stores each trip as a document with fields like its name, price, resort, and description. This structure fits the JavaScript objects in the app and allows the data to change as the project grows. Mongoose provides rules to check the data before saving it.

## Functionality

JavaScript is a programming language, while JSON is a text format for sharing data. JSON does not run code. The frontend sends and receives JSON through the API, and the backend checks that data and saves it in MongoDB.

I refactored repeated trip content into a Handlebars template. In Module 3, the trip data came from a JSON file. By Module 5, the controller retrieved it from the API instead. This let the customer and admin sides use the same saved information.

In Angular, I reused trip cards and kept API calls in a data service. I also separated login logic into an authentication service, guard, and interceptor. These changes reduced repeated code and made updates easier.

## Testing

An endpoint is an API address, and the HTTP method describes the action. GET `/api/trips` retrieves trips, POST adds one, PUT `/api/trips/:tripCode` updates one, and DELETE removes one. POST `/api/login` checks staff credentials and returns a token.

I checked response codes, returned JSON, invalid input, and saved database changes. Security testing also checks incorrect passwords and missing, expired, or altered tokens. Anyone can view trips, but staff changes require a valid token. Passwords are salted and hashed, and the server checks authorization even when Angular controls access to the screen.

The saved [final test results](Module%207/Project%20Two/travlr/testing/final) show 17 backend tests, seven Angular tests, and 25 Postman/Newman assertions across 11 requests passing. These are the earlier project results; the tests were not rerun for this README update.

## Application screenshots

These screenshots show the Module 7 admin workflow.

### Administrator login

I added a sign-in page for administrators to access trip management.

![Administrator login](Module%207/Security%20assignment/travlr%204/testing/module7/01-admin-login.png)

### Managing trips

After signing in, I could view trips and use the add, edit, and delete options.

![Managing trips](Module%207/Security%20assignment/travlr%204/testing/module7/02-authenticated-crud.png)

### Editing a trip

I used the edit form to change the trip details while signed in.

![Editing a trip](Module%207/Security%20assignment/travlr%204/testing/module7/03-protected-edit.png)

### Saving the update

The success message and updated listing showed that the change was saved.

![Saving the update](Module%207/Security%20assignment/travlr%204/testing/module7/04-save-confirmed.png)

## Reflection

This course helped me understand how the frontend, backend, and database work together. I became more comfortable tracing requests, fixing problems, and testing security instead of only checking how a page looks.

I can now show employers experience with Express, Angular, MongoDB, APIs, and authentication. I still have more to learn, but I am more confident building an app in stages and explaining my choices.

## Running the app

Follow the [final app setup guide](Module%207/Project%20Two/travlr/README.md). The main steps are to install dependencies, start MongoDB, create a private `.env` file with a new secret, seed the database, and create a staff account. Then start Express and the Angular app in separate terminals.

The customer site runs at `http://localhost:3000`, and the admin app runs at `http://localhost:4200`.
