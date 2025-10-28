/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const {
  handleSearchRequest,
  handleSearchAll,
  handleSearchAlbums,
  handleSearchArtists,
  handleSearchPlaylists,
  handleSearchTracks,
} = require("../controllers/search.controller");

router.post("/", handleSearchRequest);
router.get("/all/:query", handleSearchAll);
router.get(
  ["/albums/:query", "/albums/:query/pages/:page"],
  handleSearchAlbums
);
router.get(
  ["/artists/:query", "/artists/:query/pages/:page"],
  handleSearchArtists
);
router.get(
  ["/playlists/:query", "/playlists/:query/pages/:page"],
  handleSearchPlaylists
);
router.get(
  ["/tracks/:query", "/tracks/:query/pages/:page"],
  handleSearchTracks
);

module.exports = router;
