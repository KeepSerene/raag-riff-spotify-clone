/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const {
  handleSingleArtist,
  handleSingleArtistAlbums,
} = require("../controllers/artists.controller");

router.get("/:artistId", handleSingleArtist);
router.get(
  ["/:artistId/albums", "/:artistId/albums/pages/:page"],
  handleSingleArtistAlbums
);

module.exports = router;
