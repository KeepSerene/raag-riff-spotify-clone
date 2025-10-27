/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const {
  handleProfile,
  handleTopArtists,
  handleTopTracks,
} = require("../controllers/profile.controller");

router.get("/", handleProfile);
router.get(["/top/artists", "/top/artists/pages/:page"], handleTopArtists);
router.get(["/top/tracks", "/top/tracks/pages/:page"], handleTopTracks);

module.exports = router;
