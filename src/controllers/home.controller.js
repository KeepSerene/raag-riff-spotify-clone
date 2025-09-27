/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");

async function handleHome(req, res) {
  const currentUserProfile = await userApi.fetchCurrentUserProfile(req);
  res.render("./pages/home.ejs", { currentUserProfile });
}

module.exports = { handleHome };
