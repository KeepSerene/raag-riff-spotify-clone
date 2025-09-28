/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const userApi = require("../api/user.api");

async function handleHome(req, res) {
  try {
    const currentUserProfile = await userApi.fetchCurrentUserProfile(req);
    res.render("./pages/home.ejs", { currentUserProfile });
  } catch (error) {
    console.error("Home handler - error fetching user profile:", error.message);

    // If it's a 401 error, the token is likely expired
    if (error.response && error.response.status === 401) {
      console.log(
        "Home handler - 401 error, clearing cookies and redirecting to auth"
      );
      res.clearCookie("access_token");
      return res.redirect(
        `/auth/refresh_tokens?redirect_to=${encodeURIComponent(
          req.originalUrl
        )}`
      );
    }

    // For other errors, redirect to login
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.redirect("/login");
  }
}

module.exports = { handleHome };
