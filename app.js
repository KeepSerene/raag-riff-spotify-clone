/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const handleUserAuthentication = require("./src/middlewares/user-auth.middleware");
const loginRouter = require("./src/routes/login.route");
const authRouter = require("./src/routes/auth.route");
const tokenRouter = require("./src/routes/token.route");
const homeRouter = require("./src/routes/home.route");
const exploreRouter = require("./src/routes/explore.route");
const albumsRouter = require("./src/routes/albums.route");
const playlistsRouter = require("./src/routes/playlists.route");
const profileRouter = require("./src/routes/profile.route");
const searchRouter = require("./src/routes/search.route");

const app = express();
const port = process.env.PORT || 5000;

// Static directory
app.use(express.static(`${__dirname}/public`));

// Middleware to handle CORS headers and decode client cookies
app.use(cors()).use(cookieParser());

// Middleware to decode HTML form submissions (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

/**
 * EJS view engine setup
 */
app.set("view engine", "ejs");

/**
 * Routes setup (order matters!)
 */
// Public routes (no auth required)
app.use("/login", loginRouter);
app.use("/auth", authRouter);

// Applying authentication middleware to all routes before accessing protected routes
app.use(handleUserAuthentication);

// Protected routes (auth required)
app.use("/api/token", tokenRouter); // access token endpoint for client-side
app.use("/", homeRouter);
app.use("/explore", exploreRouter);
app.use("/albums", albumsRouter);
app.use("/playlists", playlistsRouter);
app.use("/me", profileRouter);
app.use("/search", searchRouter);

app.listen(port, () => console.log(`Server running on port ${port}`));
