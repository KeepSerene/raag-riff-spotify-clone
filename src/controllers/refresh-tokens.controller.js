/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const { refreshSpotifyTokens } = require("../api/refresh-tokens.api");

async function handleTokensRefresh(req, res) {
  const MILLISECONDS = 1000;
  const response = await refreshSpotifyTokens(req.cookies.refresh_token);

  if (response.status === 200) {
    const { access_token, expires_in } = response.data;
    res.cookie("access_token", access_token, {
      maxAge: expires_in * MILLISECONDS,
    });
    return res.redirect(req.query.redirect_to); // see user-auth.middleware.js
  } else {
    return res.redirect("/login");
  }
}

module.exports = { handleTokensRefresh };
