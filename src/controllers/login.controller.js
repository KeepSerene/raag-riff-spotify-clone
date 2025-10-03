/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

function handleLogin(req, res) {
  const { access_token, refresh_token } = req.cookies;

  if (access_token && refresh_token) {
    return res.redirect("/");
  }

  res.render("./pages/login");
}

module.exports = { handleLogin };
