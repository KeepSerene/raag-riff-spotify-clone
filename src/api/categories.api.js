/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs: https://developer.spotify.com/documentation/web-api/reference/get-categories

const apiConfig = require("../configs/api.config");
const { getApiResponse } = require("../configs/axios.config");
const { calculateOffset } = require("../utils/index");

/**
 * Get a list of categories used to tag items in Spotify
 * (e.g., on the Spotify player’s “Browse” tab)
 *
 * @param {Object} req - Express request object
 * @param {number} itemLimit - Number of playlists to return. Default is 28.
 * @returns {Promise<Object>}
 */
async function getSeveralBrowseCategories(
  req,
  itemLimit = apiConfig.DEFAULT_LIMIT
) {
  const offset = calculateOffset(req.params, itemLimit);
  const {
    data: { categories },
  } = await getApiResponse(
    `/browse/categories?limit=${itemLimit}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: req.baseUrl,
    page: req.params.page ?? 1,
    name: "Explore",
    ...categories,
  };
}

/**
 * Get a single category used to tag items in Spotify
 * (e.g., on the Spotify player’s “Browse” tab)
 *
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
async function getSingleBrowseCategory(req) {
  const { categoryId } = req.params;
  const { data: catDetails } = await getApiResponse(
    `/browse/categories/${categoryId}`,
    req.cookies.access_token
  );

  return catDetails;
}

module.exports = { getSeveralBrowseCategories, getSingleBrowseCategory };
