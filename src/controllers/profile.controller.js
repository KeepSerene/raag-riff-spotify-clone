/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const apiConfig = require("../configs/api.config");
const { formatTimestamp } = require("../utils");

async function handleProfile(req, res) {
  try {
    const currentUserProfile = await userApi.fetchProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const userTopArtists = await userApi.getTopArtists(req);
    const userTopTracks = await userApi.getTopTracks(
      req,
      apiConfig.LOWER_LIMIT / 2
    );
    const userFollowedArtists = await userApi.getFollowedArtists(req);

    res.render("./pages/profile.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      userTopArtists,
      userTopTracks,
      userFollowedArtists,
      formatTimestamp,
    });
  } catch (error) {
    console.error("Profile handler - error:", error.message);

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

async function handleTopArtists(req, res) {
  try {
    const currentUserProfile = await userApi.fetchProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const userTopArtists = await userApi.getTopArtists(
      req,
      apiConfig.DEFAULT_LIMIT
    );

    res.render("./pages/user-top-artists.ejs", {
      title: "Your Top Artists",
      currentUserProfile,
      recentlyPlayedTracks,
      artists: userTopArtists,
    });
  } catch (error) {
    console.error("Current user top artists handler - error:", error.message);

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

async function handleTopTracks(req, res) {
  try {
    const currentUserProfile = await userApi.fetchProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const userTopTracks = await userApi.getTopTracks(req, 50); // 50 is generally the Spotify Web API max limit

    res.render("./pages/user-top-tracks.ejs", {
      title: "Your Top Tracks",
      currentUserProfile,
      recentlyPlayedTracks,
      tracks: userTopTracks,
      formatTimestamp,
    });
  } catch (error) {
    console.error("Current user top tracks handler - error:", error.message);

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

module.exports = { handleProfile, handleTopArtists, handleTopTracks };
