/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

/**
 * Generates a random string containing letters and digits
 * @param {number} length - The supposed length of the random string
 * @returns {string} The generated random string
 */
function generateRandomString(length) {
  let randomString = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomString += chars[randomIndex];
  }

  return randomString;
}

module.exports = {
  generateRandomString,
};
