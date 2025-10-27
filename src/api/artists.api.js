/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs available at https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists

const { getApiResponse } = require("../configs/axios.config");
const apiConfig = require("../configs/api.config");
const { calculateOffset } = require("../utils");

/**
 * Get information about multiple artists
 * @param {Object} req - Express request object
 * @param {string} artistIds - Comma-separated artist IDs
 * @returns {Promise<Object>}
 */
async function getSeveralArtistsInfo(req, artistIds) {
  try {
    if (!artistIds || artistIds.trim() === "") {
      console.log("No artist IDs provided, returning empty result");

      return { artists: [] };
    }

    const artistIdArray = artistIds.split(",").filter((id) => id.trim() !== "");

    if (artistIdArray.length === 0) {
      return { artists: [] };
    }

    // Spotify API max: 50
    const limitedArtistIds = artistIdArray.slice(0, 50).join(",");
    const { data: severalArtistsInfo } = await getApiResponse(
      `/artists?ids=${limitedArtistIds}`,
      req.cookies.access_token
    );
    const validArtists = severalArtistsInfo.artists.filter(
      (artist) => artist !== null
    );

    return {
      ...severalArtistsInfo,
      artists: validArtists,
    };
  } catch (error) {
    console.error("Error fetching artists info:", error.message);

    return { artists: [] };
  }
}

async function getArtistAlbums(req, id, itemLimit = apiConfig.DEFAULT_LIMIT) {
  const offset = calculateOffset(req.params, itemLimit);
  const { artistId = id } = req.params;
  const { data } = await getApiResponse(
    `/artists/${artistId}/albums?limit=${itemLimit}&offset=${offset}`,
    req.cookies.access_token
  );

  return {
    baseUrl: `${req.baseUrl}/${artistId}/albums`,
    page: req.params.page ?? 1,
    ...data,
  };
}

module.exports = { getSeveralArtistsInfo, getArtistAlbums };
