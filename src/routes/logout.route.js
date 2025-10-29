/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const { handleLogout } = require("../controllers/logout.controller");

router.get("/", handleLogout);

module.exports = router;
