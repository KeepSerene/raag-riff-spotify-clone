/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

/**
 * Returns the access token for client-side use (e.g., Spotify Web Playback SDK).
 * This endpoint is protected by the authentication middleware,
 * so only authenticated users can access their token.
 */
function getAccessToken(req, res) {
  const { access_token } = req.cookies;

  // this should never happen due to the auth middleware, but just in case...
  if (!access_token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ access_token });
}

module.exports = { getAccessToken };
