/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const newReleasesApi = require("../api/new-releases.api");
const artistsApi = require("../api/artists.api");
const apiConfig = require("../configs/api.config");
const { formatTimestamp } = require("../utils");

async function handleAlbums(req, res) {
  try {
    const [currentUserProfile, recentlyPlayedTracksInfo, newReleases] =
      await Promise.all([
        userApi.fetchProfile(req),
        playerApi.getRecentlyPlayedTracksInfo(req),
        newReleasesApi.getNewReleasesWithPagination(req),
      ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    res.render("./pages/albums.ejs", {
      title: "New Releases",
      currentUserProfile,
      recentlyPlayedTracks,
      albums: newReleases,
    });
  } catch (error) {
    console.error("Albums handler - error:", error.message);

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

async function handleSingleAlbum(req, res) {
  try {
    const [currentUserProfile, recentlyPlayedTracksInfo, albumInfo] =
      await Promise.all([
        userApi.fetchProfile(req),
        playerApi.getRecentlyPlayedTracksInfo(req),
        newReleasesApi.getAlbumInfo(req),
      ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    const [firstArtist] = albumInfo.artists;
    const moreAlbumsByArtist = await artistsApi.getArtistAlbums(
      req,
      apiConfig.LOWER_LIMIT,
      firstArtist.id
    );

    res.render("./pages/single-album.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      albumInfo,
      moreByArtist: { firstArtist, ...moreAlbumsByArtist },
      formatTimestamp,
    });
  } catch (error) {
    console.error("Single album handler - error:", error.message);

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

module.exports = { handleAlbums, handleSingleAlbum };
