/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const { handleHome } = require("../controllers/home.controller");

router.get("/", handleHome);

module.exports = router;
