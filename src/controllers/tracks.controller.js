/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const tracksApi = require("../api/tracks.api");
const artistsApi = require("../api/artists.api");
const { formatTimestamp } = require("../utils");

async function handleSingleTrack(req, res) {
  try {
    const [currentUserProfile, recentlyPlayedTracksInfo, trackInfo] =
      await Promise.all([
        userApi.fetchProfile(req),
        playerApi.getRecentlyPlayedTracksInfo(req),
        tracksApi.getTrackInfo(req),
      ]);

    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );

    const trackArtistIds = trackInfo.artists.map(({ id }) => id);
    const [mainArtistId] = trackArtistIds;
    const { name, artists } = trackInfo;

    const [
      trackArtistsInfo,
      mainArtistTopTracksInfo,
      mainArtistRelatedArtistsInfo,
      trackLyricsInfo,
    ] = await Promise.all([
      artistsApi.getSeveralArtistsInfo(req, trackArtistIds.join(",")),
      artistsApi.getArtistTopTracks(req, mainArtistId),
      artistsApi.getRelatedArtists(req, mainArtistId),
      tracksApi.getTrackLyrics(name, artists.at(0).name),
    ]);

    res.render("./pages/single-track.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      trackInfo,
      trackLyricsInfo,
      trackArtistsInfo,
      mainArtistTopTracksInfo,
      mainArtistRelatedArtistsInfo,
      formatTimestamp,
    });
  } catch (error) {
    console.error("Single track handler - error:", error.message);

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

module.exports = { handleSingleTrack };
