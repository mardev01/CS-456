# Module Eight Journal

Building Travlr Getaways helped me understand how the different parts of a full stack application connect. At the beginning, I was working with the customer website and making sure its pages displayed correctly. As the project continued, I added data, API routes, the Angular admin application, and authentication. Working through those steps made it easier to understand what each part does and how a change in one part can affect another.

## Architecture and functionality

The customer site and the admin application gave me experience with two different ways of building a frontend. Express and Handlebars render the customer pages on the server, while Angular updates the admin views in the browser. Both use the same backend, so the trip information stays connected. MongoDB stores that information, and JSON gives the frontend and backend a consistent way to exchange it.

One useful change was replacing repeated trip content with templates and data. I first loaded trips from a JSON file, then changed the travel controller to get them from the API. On the admin side, the reusable trip card and shared data service helped keep the code organized. These changes made updates easier because I could change a shared piece instead of fixing the same thing in several places.

## Testing and security

Testing taught me to look beyond whether a button or page appeared to work. I needed to check the API response and confirm that the database saved the correct information. I also had to test different methods separately. Retrieving trips does not test whether adding or editing a trip works correctly.

Adding authentication made those checks more involved. A protected request needs a valid token, and the server has to reject requests that are not authorized. Testing incorrect passwords, missing tokens, and expired tokens helped me understand why hiding an admin screen is not enough. The backend still needs to enforce the rules. This connects to my interest in security because it shows how access control affects a working application.

## Professional growth

This project helped me become more comfortable troubleshooting across the frontend, backend, and database. I learned to follow the request and narrow down where something went wrong. I also got more practice organizing code, testing changes, and explaining my decisions in writing.

For my career goals, the portfolio gives me a complete example I can discuss with an employer. I can explain how the application developed, why I used reusable components, and how I checked the security features. I would not say I have mastered every part of full stack development, but I now have a stronger foundation and more confidence building and reviewing an application from start to finish.
