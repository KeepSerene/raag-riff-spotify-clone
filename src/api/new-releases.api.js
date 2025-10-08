/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs available at https://developer.spotify.com/documentation/web-api/reference/get-new-releases

const apiConfig = require("../configs/api.config");
const { getApiResponse } = require("../configs/axios.config");
const { calculateOffset } = require("../utils");

async function getNewReleasesWithPagination(
  req,
  itemLimit = apiConfig.LOWER_LIMIT
) {
  const offset = calculateOffset(req.params, itemLimit);

  const {
    data: { albums: newReleases },
  } = await getApiResponse(
    `/browse/new-releases?limit=${itemLimit}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: req.baseUrl,
    page: req.params.page ?? 1,
    ...newReleases,
  };
}

module.exports = { getNewReleasesWithPagination };
