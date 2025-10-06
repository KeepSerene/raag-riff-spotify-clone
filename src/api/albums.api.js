/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const { getApiResponse } = require("../configs/axios.config");
const playerApi = require("./player.api");
const apiConfig = require("../configs/api.config");

/**
 * Get recommended ALBUMS based on recently played tracks & Spotify Search API
 * @param {Object} req - Express request object.
 * @param {number} itemLimit - Number of items to be returned. Default is 12.
 * @returns {Promise<Object>}
 */
async function getRecommendedAlbums(req, itemLimit = apiConfig.LOWER_LIMIT) {
  try {
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req, itemLimit);

    // Extract unique artists and albums from recently played
    const recentArtists = [];
    const recentAlbums = new Set(); // tracking album IDs to avoid duplicates
    const artistSet = new Set();

    recentlyPlayedTracksInfo.items.forEach(({ track }) => {
      // Collect unique artist names
      track.artists.forEach((artist) => {
        if (!artistSet.has(artist.id)) {
          artistSet.add(artist.id);
          recentArtists.push(artist.name);
        }
      });

      // Track recently played album IDs to filter them out later
      if (track.album && track.album.id) {
        recentAlbums.add(track.album.id);
      }
    });

    // taking top 3-5 artists and search for their albums
    const topArtists = recentArtists.slice(0, 3);
    const searchQuery = topArtists
      .map((name) => `artist:"${name}"`)
      .join(" OR ");

    // Search for albums
    const { data: searchResults } = await getApiResponse(
      `/search?q=${encodeURIComponent(
        searchQuery
      )}&type=album&limit=${itemLimit}&market=${apiConfig.MARKET}`,
      req.cookies.access_token
    );

    // Filter out albums that are already in recently played
    // and sort by popularity/release date to get "recommended" feel
    const filteredAlbums = searchResults.albums.items
      .filter((album) => !recentAlbums.has(album.id))
      .sort((a, b) => {
        // newest first
        const dateA = new Date(a.release_date);
        const dateB = new Date(b.release_date);
        return dateB - dateA;
      });

    return {
      ...searchResults.albums,
      items: filteredAlbums.slice(0, itemLimit),
    };
  } catch (error) {
    console.error("Error retrieving recommended albums:", error);
    throw error;
  }
}

module.exports = { getRecommendedAlbums };
