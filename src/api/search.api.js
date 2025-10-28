/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const { getApiResponse } = require("../configs/axios.config");
const { calculateOffset } = require("../utils");
const apiConfig = require("../configs/api.config");

/**
 * Get Spotify catalog information about albums, artists, playlists, tracks, shows,
 * episodes or audiobooks that match a keyword string (query)
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
async function fetchAllResults(req) {
  const { query } = req.params;
  const { data: allSearchResults } = await getApiResponse(
    `/search?q=${query}&type=album,playlist,artist,track&limit=12`,
    req.cookies.access_token
  );

  return allSearchResults;
}

/**
 * Get Spotify catalog information about albums that match a keyword string (query)
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
async function fetchAlbums(req) {
  const { query } = req.params;
  const offset = calculateOffset(req.params);
  const {
    data: { albums: albumSearchResults },
  } = await getApiResponse(
    `/search?q=${query}&type=album&limit=${apiConfig.DEFAULT_LIMIT}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: `${req.baseUrl}/albums/${query}`,
    page: req.params.page ?? 1,
    ...albumSearchResults,
  };
}

/**
 * Get Spotify catalog information about artists that match a keyword string (query)
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
async function fetchArtists(req) {
  const { query } = req.params;
  const offset = calculateOffset(req.params);
  const {
    data: { artists: artistSearchResults },
  } = await getApiResponse(
    `/search?q=${query}&type=artist&limit=${apiConfig.DEFAULT_LIMIT}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: `${req.baseUrl}/artists/${query}`,
    page: req.params.page ?? 1,
    ...artistSearchResults,
  };
}

/**
 * Get Spotify catalog information about playlists that match a keyword string (query)
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
async function fetchPlaylists(req) {
  const { query } = req.params;
  const offset = calculateOffset(req.params);
  const {
    data: { playlists: playlistSearchResults },
  } = await getApiResponse(
    `/search?q=${query}&type=playlist&limit=${apiConfig.DEFAULT_LIMIT}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: `${req.baseUrl}/playlists/${query}`,
    page: req.params.page ?? 1,
    ...playlistSearchResults,
  };
}

/**
 * Get Spotify catalog information about tracks that match a keyword string (query)
 * @param {Object} req - Express request object
 * @param {number} itemLimit - Number of items to be returned. Default is 28.
 * @returns {Promise<Object>}
 */
async function fetchTracks(req, itemLimit = apiConfig.DEFAULT_LIMIT) {
  const { query } = req.params;
  const offset = calculateOffset(req.params, itemLimit);
  const {
    data: { tracks: trackSearchResults },
  } = await getApiResponse(
    `/search?q=${query}&type=track&limit=${itemLimit}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: `${req.baseUrl}/tracks/${query}`,
    page: req.params.page ?? 1,
    ...trackSearchResults,
  };
}

module.exports = {
  fetchAllResults,
  fetchAlbums,
  fetchArtists,
  fetchPlaylists,
  fetchTracks,
};
