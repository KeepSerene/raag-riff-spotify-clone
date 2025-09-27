/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

/**
 * Docs available at: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */

const querystring = require("querystring");
const apiConfig = require("../configs/api.config");
const utils = require("../utils/index");
const { getSpotifyTokens } = require("../api/auth.api");

// initiates the authorization request
function handleAuth(req, res) {
  const state = utils.generateRandomString(16);
  res.cookie(apiConfig.AUTH_STATE_KEY, state);
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code", // provides a short-lived code after the user authorizes
        client_id: apiConfig.CLIENT_ID,
        scope: apiConfig.SCOPES, // what permissions one needs
        redirect_uri: apiConfig.REDIRECT_URI,
        state, // anti-CSRF token
      })
  );
}

// Handle Spotify auth callback
async function handleCallback(req, res) {
  const MILLISECONDS = 1000;
  const ONE_WEEK_IN_MS = 604800000;
  const { code = null, state = null, error = null } = req.query;
  const /** {string} */ storedState = req.cookies[apiConfig.AUTH_STATE_KEY];

  if (error || !state || state !== storedState) {
    return res.redirect("/login");
  } else {
    res.clearCookie(apiConfig.AUTH_STATE_KEY);
    const response = await getSpotifyTokens(code);

    if (response.status === 200) {
      const { access_token, expires_in, refresh_token } = response.data;
      res.cookie("access_token", access_token, {
        maxAge: expires_in * MILLISECONDS,
      });
      res.cookie("refresh_token", refresh_token, { maxAge: ONE_WEEK_IN_MS });

      return res.redirect("/");
    } else {
      return res.redirect("/login");
    }
  }
}

module.exports = { handleAuth, handleCallback };
