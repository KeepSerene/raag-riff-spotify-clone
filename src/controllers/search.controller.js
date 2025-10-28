/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const searchApi = require("../api/search.api");
const { formatTimestamp } = require("../utils");

function handleSearchRequest(req, res) {
  // See search-bar.ejs to find name="query" key
  res.redirect(`/search/all/${req.body.query}`);
}

async function handleSearchAll(req, res) {
  try {
    const currentUserProfile = await userApi.fetchProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const allSearchResults = await searchApi.fetchAllResults(req);

    res.render("./pages/search-all.ejs", {
      type: "all",
      query: req.params.query,
      currentUserProfile,
      recentlyPlayedTracks,
      allSearchResults,
      formatTimestamp,
    });
  } catch (error) {
    console.error("Search handler - error:", error.message);

    // If it's a 401 error, the token has likely expired
    if (error.response && error.response.status === 401) {
      res.clearCookie("access_token");

      return res.redirect(
        `/auth/refresh_tokens?redirect_to=${encodeURIComponent(
          req.originalUrl
        )}`
      );
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.redirect("/login");
  }
}

async function handleSearchAlbums(req, res) {
  try {
    const currentUserProfile = await userApi.fetchProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const albumSearchResultsInfo = await searchApi.fetchAlbums(req);

    res.render("./pages/search-albums.ejs", {
      type: "albums",
      query: req.params.query,
      currentUserProfile,
      recentlyPlayedTracks,
      albumSearchResultsInfo,
    });
  } catch (error) {
    console.error("Search albums handler - error:", error.message);

    // If it's a 401 error, the token has likely expired
    if (error.response && error.response.status === 401) {
      res.clearCookie("access_token");

      return res.redirect(
        `/auth/refresh_tokens?redirect_to=${encodeURIComponent(
          req.originalUrl
        )}`
      );
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.redirect("/login");
  }
}

async function handleSearchArtists(req, res) {
  try {
    const currentUserProfile = await userApi.fetchProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const artistSearchResultsInfo = await searchApi.fetchArtists(req);

    res.render("./pages/search-artists.ejs", {
      type: "artists",
      query: req.params.query,
      currentUserProfile,
      recentlyPlayedTracks,
      artistSearchResultsInfo,
    });
  } catch (error) {
    console.error("Search artists handler - error:", error.message);

    // If it's a 401 error, the token has likely expired
    if (error.response && error.response.status === 401) {
      res.clearCookie("access_token");

      return res.redirect(
        `/auth/refresh_tokens?redirect_to=${encodeURIComponent(
          req.originalUrl
        )}`
      );
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.redirect("/login");
  }
}

async function handleSearchPlaylists(req, res) {
  try {
    const currentUserProfile = await userApi.fetchProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const playlistSearchResultsInfo = await searchApi.fetchPlaylists(req);

    res.render("./pages/search-playlists.ejs", {
      type: "playlists",
      query: req.params.query,
      currentUserProfile,
      recentlyPlayedTracks,
      playlistSearchResultsInfo,
    });
  } catch (error) {
    console.error("Search playlists handler - error:", error.message);

    // If it's a 401 error, the token has likely expired
    if (error.response && error.response.status === 401) {
      res.clearCookie("access_token");

      return res.redirect(
        `/auth/refresh_tokens?redirect_to=${encodeURIComponent(
          req.originalUrl
        )}`
      );
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.redirect("/login");
  }
}

async function handleSearchTracks(req, res) {
  try {
    const currentUserProfile = await userApi.fetchProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const trackSearchResultsInfo = await searchApi.fetchTracks(req, 50);

    res.render("./pages/search-tracks.ejs", {
      type: "tracks",
      query: req.params.query,
      currentUserProfile,
      recentlyPlayedTracks,
      trackSearchResultsInfo,
      formatTimestamp,
    });
  } catch (error) {
    console.error("Search tracks handler - error:", error.message);

    // If it's a 401 error, the token has likely expired
    if (error.response && error.response.status === 401) {
      res.clearCookie("access_token");

      return res.redirect(
        `/auth/refresh_tokens?redirect_to=${encodeURIComponent(
          req.originalUrl
        )}`
      );
    }

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.redirect("/login");
  }
}

module.exports = {
  handleSearchRequest,
  handleSearchAll,
  handleSearchAlbums,
  handleSearchArtists,
  handleSearchPlaylists,
  handleSearchTracks,
};
