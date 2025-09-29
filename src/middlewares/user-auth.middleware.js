/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

/**
 * Middleware for handling user authentication based on access and refresh tokens in cookies.
 *
 * Workflow:
 * - Checks for the presence of access and refresh tokens in cookies.
 * - If both tokens are missing, redirects the user to the login page.
 * - If only the access token is present, redirects to the authentication page.
 * - If only the refresh token is present, redirects to the token refresh route (preserving the original URL).
 * - If both tokens are present, passes control to the next middleware or route handler.
 *
 * @param {Object} req - Express request object, expects cookies containing access_token and refresh_token.
 * @param {Object} res - Express response object, used for sending redirects as needed.
 * @param {Function} next - Express next middleware function, called if authentication passes.
 *
 * @returns {void} Redirects or calls `next()` based on authentication status.
 *
 * Example usage:
 * app.use(handleUserAuthentication);
 */
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
