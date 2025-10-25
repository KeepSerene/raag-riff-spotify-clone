/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const {
  handleAlbums,
  handleSingleAlbum,
} = require("../controllers/albums.controller");

router.get(["/", "/pages/:page"], handleAlbums);
router.get("/:albumId", handleSingleAlbum);

module.exports = router;
