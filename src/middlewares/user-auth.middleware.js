/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

function handleUserAuthentication(req, res, next) {
  const { access_token, refresh_token } = req.cookies;

  console.log(
    "Auth middleware - access_token:",
    access_token ? "present" : "missing"
  );
  console.log(
    "Auth middleware - refresh_token:",
    refresh_token ? "present" : "missing"
  );
  console.log("Auth middleware - originalUrl:", req.originalUrl);

  // No tokens at all - redirect to login
  if (!access_token && !refresh_token) {
    console.log("No tokens found - redirecting to login");
    return res.redirect("/login");
  }

  // Has access token but no refresh token (unusual case!)
  if (access_token && !refresh_token) {
    console.log(
      "Access token present but no refresh token - redirecting to auth"
    );
    return res.redirect("/auth");
  }

  // No access token but has refresh token - needs refresh
  if (!access_token && refresh_token) {
    console.log(
      "No access token but refresh token present - redirecting to refresh"
    );
    return res.redirect(
      `/auth/refresh_tokens?redirect_to=${encodeURIComponent(req.originalUrl)}`
    );
  }

  // Both tokens present - continue to next middleware/route
  console.log("Both tokens present - continuing");
  next();
}

module.exports = handleUserAuthentication;
