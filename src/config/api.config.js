/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const BASE_URL = "https://api.spotify.com/v1";
const AUTH_TOKEN_BASE_URL = "https://accounts.spotify.com/api/token";
const CLIENT_ID = process.env.SPOTIFY_DEV_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_DEV_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_DEV_REDIRECT_URI;
const SCOPES = process.env.SPOTIFY_DEV_SCOPES;
const AUTH_STATE_KEY = "spotify_auth_state";
const MARKET = "US";
const LOWER_LIMIT = 12;
const DEFAULT_LIMIT = 28;

module.exports = {
  BASE_URL,
  AUTH_TOKEN_BASE_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  SCOPES,
  AUTH_STATE_KEY,
  MARKET,
  LOWER_LIMIT,
  DEFAULT_LIMIT,
};
