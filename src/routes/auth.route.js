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
const {
  handleTokensRefresh,
} = require("../controllers/refresh-tokens.controller");

router.get("/", handleAuth);
router.get("/callback", handleCallback);
router.get("/refresh_tokens", handleTokensRefresh); // see user-auth.middleware.js

module.exports = router;
