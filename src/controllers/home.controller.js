/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");
const playerApi = require("../api/player.api");
const albumsApi = require("../api/albums.api");
const artistsApi = require("../api/artists.api");
const newReleasesApi = require("../api/new-releases.api");
const playlistsApi = require("../api/playlists.api");

async function handleHome(req, res) {
  try {
    const [currentUserProfile, recentlyPlayedTracksInfo] = await Promise.all([
      userApi.fetchProfile(req),
      playerApi.getRecentlyPlayedTracksInfo(req),
    ]);
    const recentlyPlayedTracks = recentlyPlayedTracksInfo.items.map(
      ({ track }) => track
    );
    const [
      recommendedAlbumsInfo,
      newReleases,
      featuredPlaylistsInfo,
      categoryPlaylistsInfo,
    ] = await Promise.all([
      albumsApi.getRecommendedAlbums(req),
      newReleasesApi.getNewReleasesWithPagination(req),
      playlistsApi.getFeaturedPlaylists(req),
      playlistsApi.getCategoryPlaylists(req),
    ]);

    const recommendedAlbums = recommendedAlbumsInfo.items || [];

    // Fetch artist info from recommended albums
    let recommendedArtistsInfo = { artists: [] };

    if (recommendedAlbums.length > 0) {
      const recommendedArtistIdEntries = recommendedAlbums
        .filter((album) => album.artists && album.artists.length > 0)
        .map(({ artists }) => artists.map(({ id }) => id));

      const stringifiedUniqueIds = [
        ...new Set(recommendedArtistIdEntries.flat(1)),
      ].join(",");

      if (stringifiedUniqueIds) {
        recommendedArtistsInfo = await artistsApi.getSeveralArtistsInfo(
          req,
          stringifiedUniqueIds
        );
      }
    }

    res.render("./pages/home.ejs", {
      currentUserProfile,
      recentlyPlayedTracks,
      recommendedAlbums,
      recommendedArtistsInfo,
      newReleases,
      featuredPlaylistsInfo,
      categoryPlaylistsInfo,
    });
  } catch (error) {
    console.error("Home handler - error:", error.message);

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

module.exports = { handleHome };
