/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs available at https://developer.spotify.com/documentation/web-api/reference/get-recently-played

const apiConfig = require("../configs/api.config");
const { getApiResponse } = require("../configs/axios.config");

async function getRecentlyPlayedTracksInfo(
  req,
  itemLimit = apiConfig.DEFAULT_LIMIT
) {
  const { data: recentlyPlayedTracksInfo } = await getApiResponse(
    `/me/player/recently-played?limit=${itemLimit}`,
    req.cookies.access_token
  );

  return recentlyPlayedTracksInfo;
}

module.exports = { getRecentlyPlayedTracksInfo };
