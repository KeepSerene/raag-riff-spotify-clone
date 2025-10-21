/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs: https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

import { getAccessToken, play, transferPlayback } from "./client-player-api.js";
import { addEventListenersToElems } from "../utils.js";

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
        name,
      },
    },
  } = playerState;
  const {
    width,
    height,
    url = "/images/track-banner.png",
  } = images.find((img) => img?.width > 200 && img?.width < 400);
  const artistNames = artists.map(({ name }) => name).join(", ");
  $trackBanner.src = url;
  $trackBanner.width = width;
  $trackBanner.height = height;
  $trackBanner.alt = `${name} cover image`;
  $trackName.innerText = name;
  $trackArtists.innerText = artistNames;
  $player.classList.remove("hide");
  $player.classList.remove("disabled");
}

let $lastActivePlayBtns = [];

function updateCardPlayBtnState(playerState) {
  const {
    paused,
    context: { uri },
    track_window: {
      current_track: { uri: trackUri },
    },
  } = playerState;
  const $cardPlayBtns = document.querySelectorAll(`[data-uri="${uri}"]`);
  const $trackPlayBtns = document.querySelectorAll(
    `[data-track-uri="${trackUri}"]`
  );
  const $currentActivePlayBtns = [...$cardPlayBtns, ...$trackPlayBtns];
  $lastActivePlayBtns.forEach(($playBtn) => {
    $playBtn.classList.remove("active");
    $playBtn.setAttribute("data-play-btn", "paused");
  });
  $currentActivePlayBtns.forEach(($playBtn) => {
    $playBtn.classList[paused ? "remove" : "add"]("active");
    $playBtn.setAttribute("data-play-btn", paused ? "paused" : "playing");
  });
  $lastActivePlayBtns = $currentActivePlayBtns;
}

function updatePlayerPlayBtnState($player, playerState) {
  const $playerPlayBtn = $player.querySelector("[data-player-play-btn]");
  const { paused } = playerState;
  $playerPlayBtn.classList[paused ? "remove" : "add"]("active");
  $playerPlayBtn.setAttribute("data-play-btn", paused ? "paused" : "playing");
}

const initialDocumentTitle = document.title;

function updateDocumentTitle(playerState) {
  const {
    paused,
    track_window: {
      current_track: { artists, name: trackName },
    },
  } = playerState;
  const artistNamesStr = artists.map(({ name }) => name).join(", ");
  document.title = paused
    ? initialDocumentTitle
    : `${trackName} • ${artistNamesStr} | RaagRiff`;
}

async function togglePlay(player) {
  const deviceId = localStorage.getItem("device_id");
  const {
    context: { uri: currentUri },
    track_window: {
      current_track: { uri: currentTrackUri },
    },
  } = await player.getCurrentState();
  const { uri, trackUri, playBtn } = this.dataset; // "this" points to a play button element

  if (playBtn === "paused") {
    const isLastPlayed = currentUri === uri || currentTrackUri === trackUri;

    if ((!uri && !trackUri) || isLastPlayed) return await player.resume();

    const reqBody = {};
    uri && (reqBody.context_uri = uri);
    trackUri && (reqBody.uris = [trackUri]);
    await play(deviceId, reqBody);
  } else {
    player.pause();
  }
}

function handlePlayerStateChange(playerState) {
  const { track_window } = playerState;
  console.log("Player state:", playerState);
  $players.forEach(($player) => updatePlayerUI($player, playerState));
  updateCardPlayBtnState(playerState); // play or pause
  $players.forEach(($player) => updatePlayerPlayBtnState($player, playerState)); // play or pause
  updateDocumentTitle(playerState); // when playing a track update the document title
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
    const $playBtns = document.querySelectorAll("[data-play-btn]");
    addEventListenersToElems($playBtns, "click", function () {
      togglePlay.call(this, player);
    });
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
