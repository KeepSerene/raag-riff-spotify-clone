/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const apiConfig = require("../configs/api.config");
const { getApiResponse } = require("../configs/axios.config");
const { shuffleArray, getRandomItems, calculateOffset } = require("../utils");
const playerApi = require("./player.api");
const categoriesApi = require("./categories.api");

/**
 * Get featured/recommended playlists based on user's listening history
 * Uses recently played tracks to find relevant playlists via Spotify Search API
 * @param {Object} req - Express request object
 * @param {number} itemLimit - Number of playlists to return. Default is 12.
 * @returns {Promise<Object>}
 */
async function getFeaturedPlaylists(req, itemLimit = apiConfig.LOWER_LIMIT) {
  try {
    const offset = calculateOffset(req.params, itemLimit);
    const currentPage = req.params.page ?? 1;

    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req, itemLimit);

    const artistNames = [];
    const artistSet = new Set();

    recentlyPlayedTracksInfo.items.forEach(({ track }) => {
      track.artists.forEach((artist) => {
        if (!artistSet.has(artist.id)) {
          artistSet.add(artist.id);
          artistNames.push(artist.name);
        }
      });
    });

    // Create diverse search queries for variety
    const searchQueries = [];
    const randomArtists = getRandomItems(artistNames, 3);

    if (randomArtists.length > 0) {
      searchQueries.push(randomArtists.join(" "));
    }

    const moods = ["chill", "workout", "party", "focus", "relax", "energy"];
    searchQueries.push(moods[Math.floor(Math.random() * moods.length)]);

    const genres = ["pop", "rock", "hip hop", "electronic", "indie", "jazz"];
    searchQueries.push(genres[Math.floor(Math.random() * genres.length)]);

    // Fetch playlists from multiple search queries
    const allPlaylists = [];
    const playlistIds = new Set();

    for (const query of searchQueries) {
      const { data: searchResults } = await getApiResponse(
        `/search?q=${encodeURIComponent(query)}&type=playlist&limit=20&market=${
          apiConfig.MARKET
        }`,
        req.cookies.access_token
      );

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
    }

    // Sort by popularity and shuffle for randomness
    const sortedPlaylists = allPlaylists.sort((a, b) => {
      const followersA = a.tracks?.total || 0;
      const followersB = b.tracks?.total || 0;
      return followersB - followersA;
    });

    const topPlaylists = sortedPlaylists.slice(0, itemLimit * 3);
    const shuffledPlaylists = shuffleArray(topPlaylists);

    // Apply pagination
    const totalPlaylists = shuffledPlaylists.length;
    const paginatedPlaylists = shuffledPlaylists.slice(
      offset,
      offset + itemLimit
    );

    const hasNextPage = offset + itemLimit < totalPlaylists;
    const nextPageUrl = hasNextPage
      ? `${req.baseUrl}?page=${parseInt(currentPage) + 1}`
      : null;

    return {
      baseUrl: req.baseUrl,
      page: currentPage,
      message: "Popular Playlists",
      playlists: {
        items: paginatedPlaylists,
        total: totalPlaylists,
        limit: itemLimit,
        offset,
        next: nextPageUrl,
      },
    };
  } catch (error) {
    console.error("Error retrieving featured playlists:", error.message);
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
    const categoryId = req.params.categoryId ?? "toplists";
    const offset = calculateOffset(req.params, itemLimit);
    const currentPage = req.params.page ?? 1;

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

    let searchQuery = categorySearchTerms[categoryId] || categoryId;

    // Use category name from API if available
    if (req.params.categoryId) {
      const catDetails = await categoriesApi.getSingleBrowseCategory(req);
      if (catDetails && catDetails.name) {
        searchQuery = catDetails.name;
      }
    }

    // Fetch playlists using search API
    const { data: searchResults } = await getApiResponse(
      `/search?q=${encodeURIComponent(
        searchQuery
      )}&type=playlist&limit=50&market=${apiConfig.MARKET}`,
      req.cookies.access_token
    );

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

    // Sort by popularity
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

    const hasNextPage = offset + itemLimit < totalPlaylists;
    const nextPageUrl = hasNextPage
      ? `${req.baseUrl}${req.params.categoryId ? `/${categoryId}` : ""}/pages/${
          parseInt(currentPage) + 1
        }`
      : null;

    return {
      baseUrl: req.params.categoryId
        ? `${req.baseUrl}/${categoryId}`
        : req.baseUrl,
      page: currentPage,
      categoryId,
      playlists: {
        items: paginatedPlaylists,
        total: totalPlaylists,
        limit: itemLimit,
        offset,
        next: nextPageUrl,
      },
    };
  } catch (error) {
    console.error(`Error retrieving category playlists:`, error.message);
    throw error;
  }
}

/**
 * Get a playlist owned by a Spotify user. See
 * https://developer.spotify.com/documentation/web-api/reference/get-playlist
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
async function getPlaylistInfo(req) {
  const { playlistId } = req.params;
  const { data: playlistInfo } = await getApiResponse(
    `/playlists/${playlistId}?fields=id,type,name,images,description,external_urls,owner(display_name),followers(total),uri,tracks(name,total,items(track(id,album(name,images),artists,duration_ms,uri)))`,
    req.cookies.access_token
  );

  return playlistInfo;
}

module.exports = {
  getFeaturedPlaylists,
  getCategoryPlaylists,
  getPlaylistInfo,
};
