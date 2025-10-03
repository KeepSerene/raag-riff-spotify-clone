/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

function addEventListenersToElems(elements, eventType, eventHandler) {
  elements.forEach((elem) => elem.addEventListener(eventType, eventHandler));
}

export { addEventListenersToElems };
