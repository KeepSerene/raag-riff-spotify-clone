/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const { refreshSpotifyTokens } = require("../api/refresh-tokens.api");

async function handleTokensRefresh(req, res) {
  const MILLISECONDS = 1000;
  const { refresh_token } = req.cookies;
  const redirectTo = req.query.redirect_to || "/"; // see user-auth.middleware.js

  // If no refresh token, redirect to login
  if (!refresh_token) {
    return res.redirect("/login");
  }

  try {
    const response = await refreshSpotifyTokens(refresh_token);

    if (response.status === 200) {
      const {
        access_token,
        expires_in,
        refresh_token: new_refresh_token,
      } = response.data;

      // Set new access token
      res.cookie("access_token", access_token, {
        maxAge: expires_in * MILLISECONDS,
        httpOnly: true,
        sameSite: "lax", // CSRF protection
      });

      // Update refresh token if a new one was provided
      if (new_refresh_token) {
        const ONE_WEEK_IN_MS = 604800000;
        res.cookie("refresh_token", new_refresh_token, {
          maxAge: ONE_WEEK_IN_MS,
          httpOnly: true,
          sameSite: "lax",
        });
      }

      return res.redirect(decodeURIComponent(redirectTo));
    } else {
      console.log("Token refresh failed with status:", response.status);
      return res.redirect("/login");
    }
  } catch (error) {
    console.error("Token refresh error:", error.message);
    // If refresh fails, the refresh token might be expired/invalid
    res.clearCookie("refresh_token");
    return res.redirect("/login");
  }
}

module.exports = { handleTokensRefresh };
