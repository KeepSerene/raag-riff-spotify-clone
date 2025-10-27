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
const { formatTimestamp } = require("../utils/index");

async function handleAlbums(req, res) {
  try {
    const currentUserProfile = await userApi.fetchCurrentUserProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const newReleases = await newReleasesApi.getNewReleasesWithPagination(req);

    res.render("./pages/albums.ejs", {
      title: "New Releases",
      currentUserProfile,
      recentlyPlayedTracks,
      albums: newReleases,
    });
  } catch (error) {
    console.error("Albums handler - error:", error.message);

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
    const currentUserProfile = await userApi.fetchCurrentUserProfile(req);
    const recentlyPlayedTracksInfo =
      await playerApi.getRecentlyPlayedTracksInfo(req);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const albumInfo = await newReleasesApi.getAlbumInfo(req);
    const [firstArtist] = albumInfo.artists;
    const moreAlbumsByArtist = await artistsApi.getArtistAlbums(
      req,
      firstArtist.id,
      apiConfig.LOWER_LIMIT
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
