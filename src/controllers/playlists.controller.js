/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const playlistsApi = require("../api/playlists.api");
const { formatTimestamp } = require("../utils");

async function handlePlaylists(req, res) {
  try {
    const [
      currentUserProfile,
      recentlyPlayedTracksInfo,
      featuredPlaylistsInfo,
    ] = await Promise.all([
      userApi.fetchProfile(req),
      playerApi.getRecentlyPlayedTracksInfo(req),
      playlistsApi.getFeaturedPlaylists(req),
    ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    res.render("./pages/playlists.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      featuredPlaylistsInfo,
    });
  } catch (error) {
    console.error("Playlists handler - error:", error.message);

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

async function handleSinglePlaylist(req, res) {
  try {
    const [currentUserProfile, recentlyPlayedTracksInfo, playlistInfo] =
      await Promise.all([
        userApi.fetchProfile(req),
        playerApi.getRecentlyPlayedTracksInfo(req),
        playlistsApi.getPlaylistInfo(req),
      ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    res.render("./pages/single-playlist.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      playlistInfo,
      formatTimestamp,
    });
  } catch (error) {
    console.error("Single playlist handler - error:", error.message);

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

module.exports = { handlePlaylists, handleSinglePlaylist };
