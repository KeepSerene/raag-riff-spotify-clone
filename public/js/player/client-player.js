/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

import { getAccessToken, transferPlayback } from "./client-player-api.js";

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
    transferPlayback(device_id);
  });

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
