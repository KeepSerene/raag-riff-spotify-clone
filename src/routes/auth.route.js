/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const router = require("express").Router();
const {
  handleAuth,
  handleCallback,
} = require("../controllers/auth.controller");

router.get("/", handleAuth);
router.get("/callback", handleCallback);

module.exports = router;
