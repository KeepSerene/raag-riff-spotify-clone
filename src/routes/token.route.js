/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const { getAccessToken } = require("../controllers/token.controller");

// this route will be protected by the handleUserAuthentication middleware
router.get("/", getAccessToken);

module.exports = router;
