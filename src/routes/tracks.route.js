/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const { handleSingleTrack } = require("../controllers/tracks.controller");

router.get("/:trackId", handleSingleTrack);

module.exports = router;
