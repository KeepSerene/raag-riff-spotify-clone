/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();

const {
  handleExplore,
  handleExploreSingleCat,
} = require("../controllers/explore.controller");

router.get(["/", "/page/:page"], handleExplore);
router.get("/:categoryId", handleExploreSingleCat);

module.exports = router;
