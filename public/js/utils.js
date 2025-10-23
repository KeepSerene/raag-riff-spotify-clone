/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

function addEventListenersToElems(elements, eventType, eventHandler) {
  elements.forEach((elem) => elem.addEventListener(eventType, eventHandler));
}

/**
 * Formats a duration in milliseconds to a human-readable timestamp string.
 *
 * @param {number} milliseconds - The duration in milliseconds to format
 * @returns {string} Formatted timestamp in "m:ss" or "h:mm:ss" format.
 *                   Hours are only included if duration is 1 hour or longer.
 */
function formatTimestamp(milliseconds) {
  const totalSecs = Math.floor(milliseconds / 1000);
  const totalMins = Math.floor(totalSecs / 60);
  const totalHours = Math.floor(totalMins / 60);
  const hours = totalHours;
  const mins = totalMins % 60; // minutes left after removing hours
  const secs = totalSecs % 60; // seconds left after removing minutes

  const pad = (num) => num.toString().padStart(2, "0");

  if (hours >= 1) return `${hours}:${pad(mins)}:${pad(secs)}`;

  return `${mins}:${pad(secs)}`;
}

export { addEventListenersToElems, formatTimestamp };
