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

router.get(["/", "/pages/:page"], handleExplore); // multiple categories
router.get(
  ["/:categoryId", "/:categoryId/pages/:page"],
  handleExploreSingleCat
); // single category

module.exports = router;
