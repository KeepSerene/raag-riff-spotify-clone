/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const categoriesApi = require("../api/categories.api");
const playlistsApi = require("../api/playlists.api");
const apiConfig = require("../configs/api.config");

async function handleExplore(req, res) {
  try {
    const [currentUserProfile, recentlyPlayedTracksInfo, categories] =
      await Promise.all([
        userApi.fetchProfile(req),
        playerApi.getRecentlyPlayedTracksInfo(req),
        categoriesApi.getSeveralBrowseCategories(req),
      ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    res.render("./pages/explore.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      categories,
    });
  } catch (error) {
    console.error("Explore handler - error fetching user info:", error.message);

    // If it's a 401 error, the token has likely expired
    if (error.response && error.response.status === 401) {
      res.clearCookie("access_token");

      return res.redirect(
        `/auth/refresh_tokens?redirect_to=${encodeURIComponent(
          req.originalUrl
        )}`
      );
    }

    // For other errors, redirect to login
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.redirect("/login");
  }
}

async function handleExploreSingleCat(req, res) {
  try {
    const [
      currentUserProfile,
      recentlyPlayedTracksInfo,
      catDetails,
      catPlaylistsInfo,
    ] = await Promise.all([
      userApi.fetchProfile(req),
      playerApi.getRecentlyPlayedTracksInfo(req),
      categoriesApi.getSingleBrowseCategory(req),
      playlistsApi.getCategoryPlaylists(req, apiConfig.DEFAULT_LIMIT),
    ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    res.render("./pages/explore-single-cat.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      catDetails,
      catPlaylistsInfo,
    });
  } catch (error) {
    console.error(
      "Single Browse Category handler - error fetching user info:",
      error.message
    );

    // If it's a 401 error, the token has likely expired
    if (error.response && error.response.status === 401) {
      res.clearCookie("access_token");

      return res.redirect(
        `/auth/refresh_tokens?redirect_to=${encodeURIComponent(
          req.originalUrl
        )}`
      );
    }

    // For other errors, redirect to login
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    return res.redirect("/login");
  }
}

module.exports = { handleExplore, handleExploreSingleCat };
