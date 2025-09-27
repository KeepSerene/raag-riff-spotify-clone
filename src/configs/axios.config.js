/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const axios = require("axios");
// const querystring = require("querystring");
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

const webApi = axios.create({
  baseURL: apiConfig.BASE_URL,
});

async function getApiResponse(apiEndpoint, access_token) {
  try {
    const response = await webApi.get(apiEndpoint, {
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
