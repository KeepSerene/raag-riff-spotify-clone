/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const axios = require("axios");
const querystring = require("querystring");
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

module.exports = { authApi };
