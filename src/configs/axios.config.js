/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const axios = require("axios");
const apiConfig = require("./api.config");

const authApi = axios.create({
  baseURL: apiConfig.TOKEN_API_BASE_URL,
  headers: {
    Authorization: `Basic ${Buffer.from(
      apiConfig.CLIENT_ID + ":" + apiConfig.CLIENT_SECRET
    ).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

const spotifyWebApi = axios.create({
  baseURL: apiConfig.BASE_URL,
});

/**
 * Fetches data from a specified API endpoint using Bearer token authentication.
 * @async
 * @param {string} apiEndpoint - The API endpoint URL to request data from.
 * @param {string} access_token - The Bearer token for authorization.
 * @returns {Promise<Object>} The API response object containing the requested data.
 * @throws {Error} Throws an error if the API request fails, after logging it to the console.
 * @example
 * const response = await getApiResponse('https://api.spotify.com/v1/me', token);
 */
async function getApiResponse(apiEndpoint, access_token) {
  try {
    const response = await spotifyWebApi.get(apiEndpoint, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error retrieving Spotify Web API response:", error);
    throw error;
  }
}

module.exports = { authApi, getApiResponse };
