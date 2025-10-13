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

async function transferPlayback(device_id, shouldPlay = false) {}

export { BASE_URL, getAccessToken, getHeaders, transferPlayback };
