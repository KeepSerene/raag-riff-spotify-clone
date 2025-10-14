/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs: https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

import { getAccessToken, transferPlayback } from "./client-player-api.js";

const $players = document.querySelectorAll("[data-player]");

function updatePlayerUI($player, playerState) {
  const $trackBanner = $player.querySelector("[data-track-banner]");
  const $trackName = $player.querySelector("[data-track-name]");
  const $trackArtists = $player.querySelector("[data-track-artists]");
  const {
    track_window: {
      current_track: {
        album: { images },
        artists,
        name: trackName,
      },
    },
  } = playerState;
  const {
    width,
    height,
    url = "/images/track-banner.png",
  } = images.find((img) => img.width > 300 && img.width < 400);
  const artistNames = artists.map(({ name }) => name).join(", ");
  $trackBanner.src = url;
  $trackBanner.width = width;
  $trackBanner.height = height;
  $trackBanner.alt = `${$trackName} cover image`;
  $trackName.innerText = $trackName;
  $trackArtists.innerText = artistNames;
  $player.classList.remvoe("hide");
  $player.classList.remvoe("disabled");
}

function handlePlayerStateChange(playerState) {
  const { track_window } = playerState;
  console.log(track_window);
  $players.forEach(($player) => updatePlayerUI($player, playerState));
}

window.onSpotifyWebPlaybackSDKReady = async () => {
  const token = await getAccessToken();
  const volume = localStorage.getItem("volume") ?? 100;

  // Create an instance of the web player SDK
  const player = new Spotify.Player({
    name: "RaagRiff Web Player",
    getOAuthToken: (callback) => {
      callback(token);
    },
    volume: volume / 100,
  });

  // Add event listeners
  player.addListener("ready", ({ device_id }) => {
    // console.log("Ready with Device ID", device_id);

    localStorage.setItem("device_id", device_id);
    transferPlayback(device_id); // transfers playback to the current device
  });

  player.addListener("player_state_changed", handlePlayerStateChange);

  player.addListener("not_ready", ({ device_id }) => {
    console.log("Device ID has gone offline", device_id);
  });

  player.addListener("initialization_error", ({ message }) => {
    console.error("Initialization Error:", message);
  });

  player.addListener("authentication_error", ({ message }) => {
    console.error("Authentication Error:", message);
  });

  player.addListener("account_error", ({ message }) => {
    console.error("Account Error:", message);
  });

  // Connect to the player
  player.connect();
};
