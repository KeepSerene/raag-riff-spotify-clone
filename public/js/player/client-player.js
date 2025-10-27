/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

// Docs: https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started

import { getAccessToken, play, transferPlayback } from "./client-player-api.js";
import { addEventListenersToElems, formatTimestamp } from "../utils.js";

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

const $playerPrevTrackBtn = document.querySelector("[data-player-prev-btn]");
const $playerNextTrackBtn = document.querySelector("[data-player-next-btn]");

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

const $largePlayerProgressEl = document.querySelector(
  "[data-player-lg-progress]"
);
const $largePlayerTrackCurrentPos = document.querySelector(
  "[data-player-lg-track-current-pos]"
);
const $largePlayerTrackDuration = document.querySelector(
  "[data-player-lg-track-duration]"
);
const $smallPlayerProgressEl = document.querySelector(
  "[data-player-sm-progress]"
);
let /** { NodeJS.Timeout | undefined } */ trackLastProgressIntervalId;

function updatePlayerTrackProgress(playerState) {
  const { paused, duration, position } = playerState;
  let trackCurrentPosition = position;
  $largePlayerProgressEl.max = duration;
  $smallPlayerProgressEl.max = duration;
  $largePlayerProgressEl.value = trackCurrentPosition;
  $smallPlayerProgressEl.value = trackCurrentPosition;
  $largePlayerTrackCurrentPos.innerText = formatTimestamp(trackCurrentPosition);
  $largePlayerTrackDuration.innerText = formatTimestamp(duration);
  trackLastProgressIntervalId && clearInterval(trackLastProgressIntervalId);

  // update progress every second if playing
  if (!paused) {
    const trackCurrentProgressIntervalId = setInterval(() => {
      trackCurrentPosition += 1000;
      $largePlayerProgressEl.value = trackCurrentPosition;
      $smallPlayerProgressEl.value = trackCurrentPosition;
      $largePlayerTrackCurrentPos.innerText =
        formatTimestamp(trackCurrentPosition);
    }, 1000);
    trackLastProgressIntervalId = trackCurrentProgressIntervalId;
  }
}

async function handlePlayState(player) {
  const deviceId = localStorage.getItem("device_id");
  const {
    context: { uri: currentUri },
    track_window: {
      current_track: { uri: currentTrackUri },
    },
  } = await player.getCurrentState();
  const { uri, trackUri, playBtn } = this.dataset; // "this" points to a play button element

  if (playBtn === "paused") {
    const isCurrentlyPlaying =
      currentUri === uri || currentTrackUri === trackUri;

    if ((!uri && !trackUri) || isCurrentlyPlaying) return await player.resume();

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
  $players.forEach(($player) => updatePlayerUI($player, playerState));
  updateCardPlayBtnState(playerState); // play or pause
  $players.forEach(($player) => updatePlayerPlayBtnState($player, playerState)); // play or pause
  updateDocumentTitle(playerState); // when playing a track update the document title
  updatePlayerTrackProgress(playerState); // update track progress
  // disable previous and next track buttons conditionally
  $playerPrevTrackBtn.disabled = track_window.previous_tracks.length === 0;
  $playerNextTrackBtn.disabled = track_window.next_tracks.length === 0;
}

const $volumeProgressEl = document.querySelector("[data-volume-progress]");
const $volumeBtn = document.querySelector("[data-volume-btn]");

/**
 * Sets the speaker icon based on the current volume level.
 * @param {number} volume - The volume level, ranging from 0 to 100.
 * @returns {void}
 */
function setSpeakerIcon(volume) {
  const iconName =
    volume > 66
      ? "volume_up"
      : volume > 33
      ? "volume_down"
      : volume > 0
      ? "volume_mute"
      : "volume_off";
  $volumeBtn.innerText = iconName;
}

async function handleVolumeChange(player) {
  const vol = this.value; // "this" points to "$volumeProgressEl"
  setSpeakerIcon(vol);
  await player.setVolume(vol / 100);
  localStorage.setItem("volume", vol);
}

window.onSpotifyWebPlaybackSDKReady = async () => {
  const token = await getAccessToken();
  const volume = localStorage.getItem("volume") ?? 100; // lies in [0, 100]

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
    localStorage.setItem("device_id", device_id);

    // transfers playback to the current device
    transferPlayback(device_id);

    const $playBtns = document.querySelectorAll("[data-play-btn]");
    addEventListenersToElems($playBtns, "click", function () {
      handlePlayState.call(this, player);
    });

    // skip to the previous track
    $playerPrevTrackBtn.addEventListener("click", async () => {
      await player.previousTrack();
    });
    // skip to the next track
    $playerNextTrackBtn.addEventListener("click", async () => {
      await player.nextTrack();
    });

    // handle seek
    $largePlayerProgressEl.addEventListener("input", async function () {
      await player.seek(this.value);
    });

    // handle volume change
    $volumeProgressEl.addEventListener(
      "input",
      handleVolumeChange.bind($volumeProgressEl, player)
    );
  });

  player.addListener("player_state_changed", handlePlayerStateChange);

  player.getVolume().then((volume) => {
    // "volume" lies in [0, 1]
    $volumeProgressEl.value = volume * 100;
    setSpeakerIcon(volume * 100);
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
