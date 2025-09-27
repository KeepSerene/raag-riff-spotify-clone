/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

// Docs available at https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

"use strict";

const axiosConfig = require("../configs/axios.config");

async function refreshSpotifyTokens(oldRefreshToken) {
  try {
    const response = await axiosConfig.authApi.post("/token", {
      grant_type: "refresh_token",
      refresh_token: oldRefreshToken,
    });

    return response;
  } catch (error) {
    console.error("Error refreshing Spotify tokens:", error);
    throw error;
  }
}

module.exports = { refreshSpotifyTokens };
