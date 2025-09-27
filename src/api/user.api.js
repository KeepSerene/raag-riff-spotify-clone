/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs available at: https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile

const { getApiResponse } = require("../configs/axios.config");

async function fetchCurrentUserProfile(requestObj) {
  const { data: currentUserProfile } = await getApiResponse(
    "/me",
    requestObj.cookies.access_token
  );

  return currentUserProfile;
}

module.exports = { fetchCurrentUserProfile };
