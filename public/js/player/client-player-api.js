/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

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

export { BASE_URL, getAccessToken, getHeaders, transferPlayback };
