# Wanderlust

Wanderlust is a travel-listing web application where people can discover places to stay, share listings, and leave reviews. Listing pages include location maps, and registered users can manage their own listings and reviews.

## Features

- Browse listings and view their details, photos, and locations on a map.
- Create an account and log in with a username and password.
- Create, edit, and delete your own listings.
- Upload listing images to Cloudinary.
- Add reviews to listings and delete your own reviews.
- Validate listing and review input on the server.
- Keep users signed in with MongoDB-backed sessions.

## Tech stack

- Node.js and Express
- MongoDB and Mongoose
- EJS templates with EJS Mate layouts
- Passport Local for authentication
- Cloudinary for listing image storage
- MapLibre GL JS, OpenFreeMap tiles, and OpenStreetMap Nominatim geocoding

## Requirements

- Node.js `22.20.0` (the version specified in `package.json`)
- npm
- A MongoDB database, local or hosted
- A Cloudinary account for listing image uploads

## Getting started

1. Clone the repository and move into the project directory:

   ```bash
   git clone https://github.com/AtharvaRGhadge/wanderlust.git
   cd wanderlust
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and provide the required values:

   ```dotenv
   MONGODB_URI=mongodb://127.0.0.1:27017/wanderlust
   SECRET=replace-with-a-long-random-session-secret
   CLOUD_NAME=your-cloudinary-cloud-name
   CLOUD_API_KEY=your-cloudinary-api-key
   CLOUD_API_SECRET=your-cloudinary-api-secret
   ```

   Use your own MongoDB connection string and Cloudinary credentials. Keep `.env` private; it is ignored by Git.

4. Start the application:

   ```bash
   node app.js
   ```

5. Open [http://localhost:8080](http://localhost:8080).

The server connects to the MongoDB database specified by `MONGODB_URI` and listens on port `8080`.

## Project structure

```text
.
├── app.js                 # Express application, database, sessions, and middleware
├── cloudConfig.js         # Cloudinary configuration and upload storage
├── controllers/           # Listing, review, and user request handlers
├── init/                  # Sample listing data and database initialization script
├── middleware.js          # Authentication and ownership checks
├── models/                # Mongoose models
├── public/                # Browser JavaScript and stylesheets
├── routes/                # Listing, review, and user routes
├── schema.js              # Request validation schemas
├── utils/                 # Error, flash-message, and async helpers
└── views/                 # EJS pages and shared layouts
```

## Main routes

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/listings` | Browse listings |
| `GET` | `/listings/new` | Show the create-listing form (login required) |
| `POST` | `/listings` | Create a listing (login required) |
| `GET` | `/listings/:id` | View a listing and its reviews |
| `GET` | `/listings/:id/edit` | Edit your listing (owner only) |
| `PUT` | `/listings/:id` | Update your listing (owner only) |
| `DELETE` | `/listings/:id` | Delete your listing (owner only) |
| `POST` | `/listings/:id/reviews` | Add a review (login required) |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete your review (author only) |
| `GET`, `POST` | `/signup` | Register an account |
| `GET`, `POST` | `/login` | Log in |
| `GET` | `/logout` | Log out |

## Development notes

- `npm test` is currently a placeholder and exits with an error; no automated test suite is configured yet.
- The sample-data initializer at `init/index.js` connects to the local database `mongodb://127.0.0.1:27017/wanderlust`. It expects at least one user to exist and assigns that user as the owner of the sample listings.
- Location lookup uses the public OpenStreetMap Nominatim service. Maps use OpenFreeMap tiles and MapLibre GL JS.

## License

This project is licensed under the ISC License; see `package.json`.
