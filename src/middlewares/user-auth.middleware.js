/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

function handleUserAuthentication(req, res, next) {
  const { access_token, refresh_token } = req.cookies;

  if (!access_token && !refresh_token) {
    return res.redirect("/login");
  } else if (access_token && !refresh_token) {
    return res.redirect("/auth");
  } else if (!access_token && refresh_token) {
    return res.redirect(`/auth/refresh_tokens?redirect_to=${req.originalUrl}`);
  }

  next();
}

module.exports = handleUserAuthentication;
