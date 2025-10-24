/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const apiConfig = require("../configs/api.config");
const { getApiResponse } = require("../configs/axios.config");
const { shuffleArray, getRandomItems, calculateOffset } = require("../utils");
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
    // Calculate offset for pagination support
    const offset = calculateOffset(req.params, itemLimit);
    const currentPage = req.params.page ?? 1;

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

        // Filter out null/undefined playlists and duplicates
        searchResults.playlists.items.forEach((playlist) => {
          if (
            playlist &&
            playlist.id &&
            !playlistIds.has(playlist.id) &&
            playlist.tracks &&
            playlist.tracks.total > 0
          ) {
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

    // applying shuffling to top results for fresh recommendations on page refresh
    const topPlaylists = sortedPlaylists.slice(0, itemLimit * 3);
    const shuffledPlaylists = shuffleArray(topPlaylists);

    // applying pagination to the shuffled results
    const totalPlaylists = shuffledPlaylists.length;
    const paginatedPlaylists = shuffledPlaylists.slice(
      offset,
      offset + itemLimit
    );

    // determine if there's a next page
    const hasNextPage = offset + itemLimit < totalPlaylists;
    const nextPageUrl = hasNextPage
      ? `${req.baseUrl}?page=${parseInt(currentPage) + 1}`
      : null;

    return {
      baseUrl: req.baseUrl,
      page: currentPage,
      playlists: {
        items: paginatedPlaylists,
        total: totalPlaylists,
        limit: itemLimit,
        offset,
        next: nextPageUrl,
      },
    };
  } catch (error) {
    console.error("Error retrieving featured playlists:", error);
    throw error;
  }
}

/**
 * Get playlists for a specific category
 * Uses Spotify Search API to find category-based playlists
 * @param {Object} req - Express request object
 * @param {number} itemLimit - Number of playlists to return. Default is 12.
 * @returns {Promise<Object>}
 */
async function getCategoryPlaylists(req, itemLimit = apiConfig.LOWER_LIMIT) {
  try {
    // Extract category from params with default value
    const categoryId = req.params.categoryId ?? "toplists";

    // Calculate offset for pagination support
    const offset = calculateOffset(req.params, itemLimit);
    const currentPage = req.params.page ?? 1;

    // Map category IDs to search-friendly terms
    const categorySearchTerms = {
      toplists: "top hits popular charts",
      pop: "pop music",
      hiphop: "hip hop rap",
      rock: "rock music",
      workout: "workout fitness gym",
      chill: "chill relax ambient",
      party: "party dance",
      focus: "focus study concentration",
      country: "country music",
      latin: "latin music",
      rnb: "r&b soul",
      indie: "indie alternative",
      electronic: "electronic edm",
      jazz: "jazz music",
      classical: "classical music",
      metal: "metal rock",
      sleep: "sleep relaxation",
      mood: "mood vibes",
      travel: "travel",
      gaming: "gaming",
    };

    // Get search term for the category, fallback to category ID itself
    const searchQuery = categorySearchTerms[categoryId] || categoryId;

    // Fetch playlists using search API with increased limit for better filtering
    const { data: searchResults } = await getApiResponse(
      `/search?q=${encodeURIComponent(
        searchQuery
      )}&type=playlist&limit=50&market=${apiConfig.MARKET}`,
      req.cookies.access_token
    );

    // Filter and collect valid playlists
    const allPlaylists = [];
    const playlistIds = new Set();

    searchResults.playlists.items.forEach((playlist) => {
      if (
        playlist &&
        playlist.id &&
        !playlistIds.has(playlist.id) &&
        playlist.tracks &&
        playlist.tracks.total > 0
      ) {
        playlistIds.add(playlist.id);
        allPlaylists.push(playlist);
      }
    });

    // Sort by popularity (track count and implicit popularity)
    const sortedPlaylists = allPlaylists.sort((a, b) => {
      const tracksA = a.tracks?.total || 0;
      const tracksB = b.tracks?.total || 0;
      return tracksB - tracksA;
    });

    // Apply pagination
    const totalPlaylists = sortedPlaylists.length;
    const paginatedPlaylists = sortedPlaylists.slice(
      offset,
      offset + itemLimit
    );

    // Determine if there's a next page
    const hasNextPage = offset + itemLimit < totalPlaylists;
    const nextPageUrl = hasNextPage
      ? `${req.baseUrl}/${categoryId}/page/${parseInt(currentPage) + 1}`
      : null;

    return {
      baseUrl: `${req.baseUrl}/${categoryId}`,
      page: currentPage,
      categoryId,
      playlists: {
        items: paginatedPlaylists,
        total: totalPlaylists,
        limit: itemLimit,
        offset: offset,
        next: nextPageUrl,
      },
    };
  } catch (error) {
    console.error(
      `Error retrieving category playlists for "${req.params.categoryId}":`,
      error
    );
    throw error;
  }
}

module.exports = { getFeaturedPlaylists, getCategoryPlaylists };
