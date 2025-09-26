/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const querystring = require("querystring");
const apiConfig = require("../config/api.config");
const utils = require("../utils/index");

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

module.exports = { handleAuth };
