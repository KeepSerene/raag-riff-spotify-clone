/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const loginRouter = require("./src/routes/login.route");
const authRouter = require("./src/routes/auth.route");
const tokenRouter = require("./src/routes/token.route");
const homeRouter = require("./src/routes/home.route");
const exploreRouter = require("./src/routes/explore.route");
const albumsRouter = require("./src/routes/albums.route");
const handleUserAuthentication = require("./src/middlewares/user-auth.middleware");

const app = express();
const port = process.env.PORT || 5000;

// Static directory
app.use(express.static(`${__dirname}/public`));

// Enable cors & cookie-parser
app.use(cors()).use(cookieParser());

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

app.listen(port, () => console.log(`Server running on port ${port}`));
