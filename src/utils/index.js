/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

const apiConfig = require("../configs/api.config");

/**
 * Generate a random string of specified length
 * @param {number} length - The length of the random string
 * @returns {string} - A random string
 */
function generateRandomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Calculate the offset for paginated API requests
 *
 * Converts a page number to the corresponding offset value needed for
 * pagination in API calls (e.g., Spotify Web API).
 *
 * @param {Object} params - The query parameters object from the request
 * @param {number} [params.page=1] - The page number (1-indexed)
 * @param {number} [limit=apiConfig.DEFAULT_LIMIT] - The maximum number of items per page
 * @returns {number} The calculated offset (number of records to skip)
 *
 * @example
 * // Page 1, limit 28 → offset: 0
 * calculateOffset({ page: 1 }, 28); // returns 0
 *
 * @example
 * // Page 3, limit 28 → offset: 56
 * calculateOffset({ page: 3 }, 28); // returns 56
 *
 * @example
 * // No page specified, uses default page 1
 * calculateOffset({}, 20); // returns 0
 */
function calculateOffset(params, limit = apiConfig.DEFAULT_LIMIT) {
  const { page = 1 } = params;

  return limit * (page - 1);
}

/**
 * Shuffle array using Fisher-Yates algorithm for randomness
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Get random items from array
 * @param {Array} array - Source array
 * @param {number} count - Number of items to get
 * @returns {Array} Random items
 */
function getRandomItems(array, count) {
  const shuffled = shuffleArray(array);

  return shuffled.slice(0, Math.min(count, array.length));
}

module.exports = {
  generateRandomString,
  calculateOffset,
  shuffleArray,
  getRandomItems,
};
