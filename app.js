/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const cors = require("cors");
const cookieParser = require("cookie-parser");
const { login } = require("./src/controllers/login.controller");
const express = require("express");

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
 * Login page
 */
app.get("/login", login);

app.listen(port, () => console.log(`Server running on port ${port}`));
