/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const apiConfig = require("../configs/api.config");
const axiosConfig = require("../configs/axios.config");

/**
 * Exchanges an authorization code for Spotify tokens.
 *
 * @async
 * @param {string} code - An authorization code received from Spotify's authorization endpoint.
 * @returns {Promise<Object>} - On success, resolves with the API response object.
 *
 * Successful response (HTTP 200 OK) will contain JSON in the following format:
 * ```
 * {
 *   access_token: string,   // An access token that can be used in subsequent Spotify Web API calls
 *   token_type: string,     // Always "Bearer"
 *   scope: string,          // A space-separated list of scopes granted for this access token
 *   expires_in: number,     // Time in seconds for which the access token is valid
 *   refresh_token: string   // Token used to refresh the access token when it expires
 * }
 * ```
 *
 *  @throws Will rethrow the error from axios so callers can handle it (e.g. return 401 or retry).
 */
async function getSpotifyTokens(code) {
  try {
    const response = await axiosConfig.authApi.post("/token", {
      grant_type: "authorization_code",
      code,
      redirect_uri: apiConfig.REDIRECT_URI,
    });

    return response;
  } catch (error) {
    console.error("Error retrieving Access Token:", error);
    throw error;
  }
}

module.exports = { getSpotifyTokens };
