/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const { getApiResponse } = require("../configs/axios.config");
const playerApi = require("./player.api");
const apiConfig = require("../configs/api.config");
const { shuffleArray } = require("../utils");

/**
 * Get recommended albums based on recently played tracks & Spotify Search API
 * @param {Object} req - Express request object.
 * @param {number} itemLimit - Number of items to be returned. Default is 12.
 * @returns {Promise<Object>}
 */
async function getRecommendedAlbums(req, itemLimit = apiConfig.LOWER_LIMIT) {
  try {
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req, itemLimit);
    const recentArtists = [];
    const recentAlbumIds = new Set();
    const artistSet = new Set();

    recentlyPlayedTracksInfo.items.forEach(({ track }) => {
      track.artists.forEach((artist) => {
        if (!artistSet.has(artist.id)) {
          artistSet.add(artist.id);
          recentArtists.push(artist.name);
        }
      });

      if (track.album && track.album.id) {
        recentAlbumIds.add(track.album.id);
      }
    });

    const topArtists = recentArtists.slice(0, 5);
    // Search each artist individually for better results
    const allAlbums = [];
    const seenAlbumIds = new Set(recentAlbumIds);

    for (const artistName of topArtists) {
      const searchQuery = `artist:"${artistName}"`;

      const { data: searchResults } = await getApiResponse(
        `/search?q=${encodeURIComponent(
          searchQuery
        )}&type=album&limit=10&market=${apiConfig.MARKET}`,
        req.cookies.access_token
      );

      searchResults.albums.items.forEach((album) => {
        if (album && album.id && !seenAlbumIds.has(album.id)) {
          seenAlbumIds.add(album.id);
          allAlbums.push(album);
        }
      });

      // Early exit if we have plenty of albums
      if (allAlbums.length >= itemLimit * 3) {
        console.log(`Collected ${allAlbums.length} albums, stopping search`);
        break;
      }
    }

    // Sort by release date (newest first), shuffle, and select final albums
    const sortedAlbums = allAlbums.sort((a, b) => {
      const dateA = new Date(a.release_date);
      const dateB = new Date(b.release_date);
      return dateB - dateA;
    });

    const shuffledAlbums = shuffleArray(sortedAlbums);
    const finalAlbums = shuffledAlbums.slice(0, itemLimit);

    return {
      items: finalAlbums,
      total: finalAlbums.length,
      limit: itemLimit,
      href: "",
      next: null,
      offset: 0,
      previous: null,
    };
  } catch (error) {
    console.error("Error retrieving recommended albums:", error.message);

    return {
      items: [],
      total: 0,
      limit: itemLimit,
      href: "",
      next: null,
      offset: 0,
      previous: null,
    };
  }
}

module.exports = { getRecommendedAlbums };
