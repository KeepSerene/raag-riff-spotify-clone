/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const artistsApi = require("../api/artists.api");
const apiConfig = require("../configs/api.config");
const { formatTimestamp } = require("../utils");

async function handleSingleArtist(req, res) {
  try {
    const [
      currentUserProfile,
      recentlyPlayedTracksInfo,
      artistAlbumsInfo,
      artistInfo,
      artistTopTracksInfo,
      relatedArtistsInfo,
    ] = await Promise.all([
      userApi.fetchProfile(req),
      playerApi.getRecentlyPlayedTracksInfo(req),
      artistsApi.getArtistAlbums(req, apiConfig.LOWER_LIMIT),
      artistsApi.getArtistInfo(req),
      artistsApi.getArtistTopTracks(req),
      artistsApi.getRelatedArtists(req),
    ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    res.render("./pages/single-artist.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      artistAlbumsInfo,
      artistInfo,
      artistTopTracksInfo,
      formatTimestamp,
      relatedArtistsInfo,
    });
  } catch (error) {
    console.error("Single artist handler - error:", error.message);

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

async function handleSingleArtistAlbums(req, res) {
  try {
    const [
      currentUserProfile,
      recentlyPlayedTracksInfo,
      artistAlbumsInfo,
      artistInfo,
    ] = await Promise.all([
      userApi.fetchProfile(req),
      playerApi.getRecentlyPlayedTracksInfo(req),
      artistsApi.getArtistAlbums(req),
      artistsApi.getArtistInfo(req),
    ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    res.render("./pages/albums.ejs", {
      title: artistInfo.name,
      currentUserProfile,
      recentlyPlayedTracks,
      albums: artistAlbumsInfo,
      isArtistAlbum: true,
    });
  } catch (error) {
    console.error("Single artist albums handler - error:", error.message);

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

module.exports = { handleSingleArtist, handleSingleArtistAlbums };
