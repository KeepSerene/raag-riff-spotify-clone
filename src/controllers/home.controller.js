/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
// const playerApi = require("../api/player.api");
// const tracksApi = require("../api/tracks.api");
const albumsApi = require("../api/albums.api");
const artistsApi = require("../api/artists.api");

async function handleHome(req, res) {
  try {
    const currentUserProfile = await userApi.fetchCurrentUserProfile(req);
    // const recentlyPlayedTracksInfo =
    //   await playerApi.getRecentlyPlayedTracksInfo(req);
    // const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
    //   ({ track }) => track
    // );
    // const recommendedTracksInfo = await tracksApi.getRecommendedTracks(req);
    const recommendedAlbumsInfo = await albumsApi.getRecommendedAlbums(req);
    const recommendedAlbums = recommendedAlbumsInfo.items;
    // console.log("Recommended tracks info:", recommendedTracksInfo);
    // console.log("Recommended albums info:", recommendedAlbumsInfo);
    const recommendedArtistIdEntries = recommendedAlbums.map(({ artists }) =>
      artists.map(({ id }) => id)
    );
    const stringifiedUniqueIds = [
      ...new Set(recommendedArtistIdEntries.flat(1)),
    ].join(",");
    const recommendedArtistsInfo = await artistsApi.getSeveralArtistsInfo(
      req,
      stringifiedUniqueIds
    );
    console.log("Recommended artists info:", recommendedArtistsInfo);

    res.render("./pages/home.ejs", {
      currentUserProfile,
      // recentlyPlayedTracks,
      recommendedAlbums,
      recommendedArtistsInfo,
    });
  } catch (error) {
    console.error("Home handler - error fetching user info:", error.message);

    // If it's a 401 error, the token has likely expired
    if (error.response && error.response.status === 401) {
      console.log(
        "Home handler - 401 error, clearing cookies and redirecting to auth"
      );
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

module.exports = { handleHome };
