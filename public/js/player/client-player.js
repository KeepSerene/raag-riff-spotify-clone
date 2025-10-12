/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

window.onSpotifyWebPlaybackSDKReady = () => {
  const token = "[My access token]";

  // Create an instance of the web player
  const player = new Spotify.Player({
    name: "RaagRiff Web Player",
    getOAuthToken: (callback) => {
      callback(token);
    },
    volume: 0.5,
  });
};
