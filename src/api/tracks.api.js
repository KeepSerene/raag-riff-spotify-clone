/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const { getApiResponse } = require("../configs/axios.config");
const { GeniusClient } = require("../configs/api.config");
const { cleanLyricsText, getPartialLyrics } = require("../utils");

/**
 * Get Spotify catalog information for a single track identified by its unique Spotify ID
 * @param {Object} req - Express request object
 * @returns {Promise<Object>}
 */
async function getTrackInfo(req) {
  const { trackId } = req.params;
  const { data: trackInfo } = await getApiResponse(
    `/tracks/${trackId}`,
    req.cookies.access_token
  );

  return trackInfo;
}

/**
 * Get lyrics for a track using Genius API
 * @param {string} trackName - Name of the track
 * @param {string} artistName - Name of the artist
 * @returns {Promise<Object>} Object containing lyrics and metadata
 */
async function getTrackLyrics(trackName, artistName) {
  try {
    const cleanTrackName = trackName
      .replace(/\(.*?\)/g, "") // remove content in parentheses
      .replace(/\[.*?\]/g, "") // remove content in brackets
      .replace(/\s*-\s*.*?Remaster.*$/i, "") // remove remaster info
      .replace(/\s*feat\..*$/i, "") // remove featuring
      .replace(/\s*ft\..*$/i, "") // remove ft.
      .trim();
    const cleanArtistName = artistName.split(",")[0].split("&")[0].trim();

    // search for the song
    const searchQuery = `${cleanTrackName} ${cleanArtistName}`;
    const searches = await GeniusClient.songs.search(searchQuery);

    if (!searches || searches.length === 0) {
      console.log("No songs found on Genius");

      return {
        found: false,
        lyrics: null,
        message: "Lyrics not found for this track",
        source: "genius",
      };
    }

    const firstTrack = searches.at(0);

    if (!firstTrack) {
      console.log("First track is undefined");

      return {
        source: "genius",
        found: false,
        lyrics: null,
        message: "No such track available!",
      };
    }

    // full lyrics
    const rawLyrics = await firstTrack.lyrics();

    if (!rawLyrics) {
      console.log("Lyrics content is empty");

      return {
        source: "genius",
        found: false,
        lyrics: null,
        message: "Lyrics not available for this track!",
      };
    }

    const cleanedLyrics = cleanLyricsText(rawLyrics);

    if (!cleanedLyrics || cleanedLyrics.length < 4) {
      console.log("Cleaned lyrics are too short or empty");

      return {
        source: "genius",
        found: false,
        lyrics: null,
        message: "Lyrics not available for this track!",
      };
    }

    // partial lyrics: 50% or 16 lines max
    const partialLyricsData = getPartialLyrics(cleanedLyrics);

    return {
      source: "genius",
      found: true,
      lyrics: partialLyricsData.lyrics,
      isPartial: partialLyricsData.isPartial,
      totalLines: partialLyricsData.totalLines,
      shownLines: partialLyricsData.shownLines,
      songTitle: firstTrack.title,
      songArtist: firstTrack.artist.name,
      songUrl: firstTrack.url,
      message: partialLyricsData.isPartial
        ? "Partial lyrics shown"
        : "Full lyrics shown",
    };
  } catch (error) {
    console.error("Error fetching track lyrics:", error.message);

    return {
      found: false,
      lyrics: null,
      error: error.message,
      message: "Unable to fetch lyrics at this time!",
      source: "genius",
    };
  }
}

module.exports = { getTrackInfo, getTrackLyrics };
