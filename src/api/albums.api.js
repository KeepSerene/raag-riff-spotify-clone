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
    const recentAlbumIds = new Set(); // tracking album IDs to avoid duplicates
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
        recentAlbumIds.add(track.album.id);
      }
    });

    const topArtists = recentArtists.slice(0, 5);
    console.log("Top artists", topArtists);

    const searchQuery = topArtists
      .map((name) => `artist:"${name}"`)
      .join(" OR ");

    // Search for albums
    const { data: searchResults } = await getApiResponse(
      `/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=${
        itemLimit * 2 // larger search pool
      }&market=${apiConfig.MARKET}`,
      req.cookies.access_token
    );
    console.log("Search results", searchResults);

    // track unique albums only
    const uniqueAlbums = [];
    const seenAlbumIds = new Set(recentAlbumIds);
    searchResults.albums.items.forEach((album) => {
      if (!seenAlbumIds.has(album.id)) {
        seenAlbumIds.add(album.id);
        uniqueAlbums.push(album);
      }
    });
    // Sort by release date to get newest first
    const sortedAlbums = uniqueAlbums.sort((a, b) => {
      const dateA = new Date(a.release_date);
      const dateB = new Date(b.release_date);

      return dateB - dateA;
    });
    // adding randomness to make recommendations feel fresh on page refresh
    const shuffledAlbums = shuffleArray(sortedAlbums);
    // taking a random subset that includes both recent and older albums
    const finalAlbums = shuffledAlbums.slice(0, itemLimit);

    return {
      ...searchResults.albums,
      items: finalAlbums,
    };
  } catch (error) {
    console.error("Error retrieving recommended albums:", error);
    throw error;
  }
}

module.exports = { getRecommendedAlbums };
