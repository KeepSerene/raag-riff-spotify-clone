/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const {
  handlePlaylists,
  handleSinglePlaylist,
} = require("../controllers/playlists.controller");

router.get(["/", "/pages/:page"], handlePlaylists);
router.get("/:playlistId", handleSinglePlaylist);

module.exports = router;
