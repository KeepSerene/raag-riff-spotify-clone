/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs available at https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists

const { getApiResponse } = require("../configs/axios.config");

async function getSeveralArtistsInfo(req, artistIds) {
  const { data: severalArtistsInfo } = await getApiResponse(
    `/artists?ids=${artistIds}`,
    req.cookies.access_token
  );

  return severalArtistsInfo;
}

module.exports = { getSeveralArtistsInfo };
