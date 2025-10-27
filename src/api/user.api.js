/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs available at: https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile

const { getApiResponse } = require("../configs/axios.config");
const apiConfig = require("../configs/api.config");
const { calculateOffset } = require("../utils");

async function fetchProfile(req) {
  const { data: currentUserProfile } = await getApiResponse(
    "/me",
    req.cookies.access_token
  );

  return currentUserProfile;
}

/**
 * Get current user's top artists based on calculated affinity
 * @param {Object} req - Express request object.
 * @param {number} itemLimit - Number of top artists to return. Default is 12.
 * @returns {Promise<Object>}
 */
async function getTopArtists(req, itemLimit = apiConfig.LOWER_LIMIT) {
  const offset = calculateOffset(req.params, itemLimit);
  const { data: topArtistsInfo } = await getApiResponse(
    `/me/top/artists?limit=${itemLimit}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: `${req.baseUrl}/top/artists`,
    page: req.params.page ?? 1,
    ...topArtistsInfo,
  };
}

/**
 * Get current user's top tracks based on calculated affinity
 * @param {Object} req - Express request object.
 * @param {number} itemLimit - Number of top artists to return. Default is 12.
 * @returns {Promise<Object>}
 */
async function getTopTracks(req, itemLimit = apiConfig.LOWER_LIMIT) {
  const offset = calculateOffset(req.params, itemLimit);
  const { data: topTracksInfo } = await getApiResponse(
    `/me/top/tracks?limit=${itemLimit}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: `${req.baseUrl}/top/tracks`,
    page: req.params.page ?? 1,
    ...topTracksInfo,
  };
}

/**
 * Get the current user's followed artists
 * @param {Object} req - Express request object
 * @returns {Promise<number>}
 */
async function getFollowedArtists(req) {
  const {
    data: { artists: followedArtists },
  } = await getApiResponse(
    "/me/following?type=artist",
    req.cookies.access_token
  );

  return followedArtists;
}

module.exports = {
  fetchProfile,
  getTopArtists,
  getTopTracks,
  getFollowedArtists,
};
