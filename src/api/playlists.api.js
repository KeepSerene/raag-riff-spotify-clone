/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const apiConfig = require("../configs/api.config");
const { getApiResponse } = require("../configs/axios.config");
const { shuffleArray, getRandomItems } = require("../utils");
const playerApi = require("./player.api");

/**
 * Get featured/recommended playlists based on user's listening history
 * Uses recently played tracks to find relevant playlists via Spotify Search API
 * @param {Object} req - Express request object
 * @param {number} itemLimit - Number of playlists to return. Default is 12.
 * @returns {Promise<Object>}
 */
async function getFeaturedPlaylists(req, itemLimit = apiConfig.LOWER_LIMIT) {
  try {
    // Get recently played tracks to understand user preferences
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req, itemLimit);

    // Extract unique genres, artists, and track characteristics
    const artistNames = [];
    const trackNames = [];
    const artistSet = new Set();

    recentlyPlayedTracksInfo.items.forEach(({ track }) => {
      // Collect unique artist names
      track.artists.forEach((artist) => {
        if (!artistSet.has(artist.id)) {
          artistSet.add(artist.id);
          artistNames.push(artist.name);
        }
      });

      // Collect track names for keyword matching
      if (track.name) {
        trackNames.push(track.name);
      }
    });

    // Creating diverse search queries for variety
    const searchQueries = [];

    // Query 1: Search by top artists (take random 2-3 artists)
    const randomArtists = getRandomItems(artistNames, 3);

    if (randomArtists.length > 0) {
      searchQueries.push(randomArtists.join(" "));
    }

    // Query 2: Generic mood-based playlists
    const moods = ["chill", "workout", "party", "focus", "relax", "energy"];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    searchQueries.push(randomMood);

    // Query 3: Genre-based search (popular genres)
    const genres = ["pop", "rock", "hip hop", "electronic", "indie", "jazz"];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    searchQueries.push(randomGenre);

    // Fetch playlists from multiple search queries
    const allPlaylists = [];
    const playlistIds = new Set();

    for (const query of searchQueries) {
      try {
        const { data: searchResults } = await getApiResponse(
          `/search?q=${encodeURIComponent(
            query
          )}&type=playlist&limit=20&market=${apiConfig.MARKET}`,
          req.cookies.access_token
        );

        // Filter out duplicates and add to collection
        searchResults.playlists.items.forEach((playlist) => {
          if (!playlistIds.has(playlist.id) && playlist.tracks.total > 0) {
            playlistIds.add(playlist.id);
            allPlaylists.push(playlist);
          }
        });
      } catch (error) {
        console.error(
          `Error searching playlists for query "${query}":`,
          error.message
        );
        // continue with other queries even if one fails
      }
    }

    // Sort by popularity (follower count) and shuffle for randomness
    const sortedPlaylists = allPlaylists.sort((a, b) => {
      const followersA = a.tracks?.total || 0;
      const followersB = b.tracks?.total || 0;

      return followersB - followersA;
    });

    // applying shuffling to top results for fresh recommendations on refresh
    const topPlaylists = sortedPlaylists.slice(0, itemLimit * 3);
    const shuffledPlaylists = shuffleArray(topPlaylists);

    return {
      playlists: {
        items: shuffledPlaylists.slice(0, itemLimit),
        total: shuffledPlaylists.length,
        limit: itemLimit,
      },
    };
  } catch (error) {
    console.error("Error retrieving featured playlists:", error);
    throw error;
  }
}

module.exports = { getFeaturedPlaylists };
