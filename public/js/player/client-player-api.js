/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

import { showToast } from "../toast.js";

const BASE_URL = "https://api.spotify.com/v1";

/**
 * Fetch access token from server
 * @returns {Promise<string>}
 */
async function getAccessToken() {
  try {
    const response = await fetch("/api/token");

    if (!response.ok) {
      throw new Error("Failed to fetch access token");
    }

    const data = await response.json();

    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    window.location.href = "/login";
    throw error;
  }
}

/**
 * Get headers with authorization
 * @returns {Promise<Object>}
 */
async function getHeaders() {
  const token = await getAccessToken();

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * Transfer playback to a new device and optionally begin playback.
 * Only works with Spotify Premium: https://developer.spotify.com/documentation/web-api/reference/transfer-a-users-playback
 *
 * @param {string} deviceId -  The ID of the device on which playback should be started/transferred
 * @param {boolean} shouldPlay - Decides whether playback happens on the intended device
 * @returns {Promise<void>}
 */
async function transferPlayback(deviceId, shouldPlay = false) {
  try {
    const headers = await getHeaders();
    const reqBody = { device_ids: [deviceId], play: shouldPlay };

    await fetch(`${BASE_URL}/me/player`, {
      headers,
      method: "PUT",
      body: JSON.stringify(reqBody),
    });
  } catch (error) {
    console.error("Error transferring playback to the intended device:", error);
  }
}

/**
 * Start a new context or resume current playback on the user's active device.
 * Only works with Spotify Premium.
 *
 * @param {string} deviceId - Current user device ID
 * @param {Object} reqBody - The request body
 * @returns {Promise<void>}
 */
async function play(deviceId, reqBody) {
  try {
    const headers = await getHeaders();
    const response = await fetch(
      `${BASE_URL}/me/player/play?device_id=${deviceId}`,
      {
        headers,
        method: "PUT",
        body: JSON.stringify(reqBody),
      }
    );

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || "Content not available!";

      if (
        errorMessage.includes("Restriction violated") ||
        errorMessage.includes("Premium")
      ) {
        showToast({
          message:
            "This content is not available in your region or requires Premium!",
          icon: "block",
          action: "",
        });
      } else {
        showToast({
          message: "Content not available!",
          icon: "error",
          action: "",
        });
      }

      return;
    }

    if (!response.ok) {
      console.error("Playback error:", response.status, response.statusText);
      showToast({
        message: "Unable to play this track",
        icon: "error",
        action: "",
      });
      return;
    }

    return response;
  } catch (error) {
    console.error("Error playing track:", error);
    showToast({
      message: "Failed to play track",
      icon: "error",
      action: "",
    });
  }
}

/**
 * Skip to the next track in the user's queue.
 * Only works with Spotify Premium.
 * @returns {Promise<void>}
 */
async function skipToNext() {
  try {
    const headers = await getHeaders();
    await fetch(`${BASE_URL}/me/player/next`, {
      headers,
      method: "POST",
    });
  } catch (error) {
    console.error("Error skipping to next track:", error);
  }
}

/**
 * Skip to the previous track in the user's queue.
 * Only works with Spotify Premium.
 * @returns {Promise<void>}
 */
async function skipToPrevious() {
  try {
    const headers = await getHeaders();
    await fetch(`${BASE_URL}/me/player/previous`, {
      headers,
      method: "POST",
    });
  } catch (error) {
    console.error("Error skipping to previous track:", error);
  }
}

export {
  BASE_URL,
  getAccessToken,
  getHeaders,
  transferPlayback,
  play,
  skipToNext,
  skipToPrevious,
};
