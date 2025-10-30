/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const Genius = require("genius-lyrics");

// Spotify web API configs
const BASE_URL = "https://api.spotify.com/v1";
const TOKEN_API_BASE_URL = "https://accounts.spotify.com/api";
const CLIENT_ID = process.env.SPOTIFY_DEV_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_DEV_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_DEV_REDIRECT_URI;
const SCOPES = process.env.SPOTIFY_DEV_SCOPES;
const AUTH_STATE_KEY = "spotify_auth_state";
const MARKET = "US";
const LOWER_LIMIT = 12;
const DEFAULT_LIMIT = 28;

// Genius API (for lyrics) configs
// Get Genius client access token from https://genius.com/api-clients
const GENIUS_CLIENT_ACCESS_TOKEN = process.env.GENIUS_CLIENT_ACCESS_TOKEN;
const GeniusClient = new Genius.Client(GENIUS_CLIENT_ACCESS_TOKEN);

module.exports = {
  BASE_URL,
  TOKEN_API_BASE_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  SCOPES,
  AUTH_STATE_KEY,
  MARKET,
  LOWER_LIMIT,
  DEFAULT_LIMIT,
  GeniusClient,
};
