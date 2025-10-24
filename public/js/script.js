/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

import { addEventListenersToElems } from "./utils.js";

/**
 * Search clear functionality
 */
const $searchField = document.querySelector("[data-search-field]");
const $searchClearBtn = document.querySelector("[data-search-clear]");

$searchClearBtn?.addEventListener("click", () => {
  $searchField.value = "";
});

/**
 * Logo animation on mobile devices
 */
const $logo = document.querySelector("[data-logo]");

if (!sessionStorage.getItem("logoAnimationDone")) {
  $logo.classList.add("animate");
  sessionStorage.setItem("logoAnimationDone", true);
}

/**
 * Menu toggle
 */
const $menuWrapper = document.querySelector("[data-menu-wrapper]");
const $menuTogglerBtn = document.querySelector("[data-menu-toggler]");

$menuTogglerBtn.addEventListener("click", () => {
  $menuWrapper.classList.toggle("active");
});

/**
 * Hide top bar on scroll
 */
const $page = document.querySelector("[data-page]");
const DELTA = 8; // ignore tiny scrolls under this many pixels
let prevScrollPos = 0;

$page.addEventListener("scroll", function () {
  if (Math.abs(this.scrollTop - prevScrollPos) <= DELTA) {
    return; // ignore DELTA amount scrolls
  } else if (this.scrollTop > prevScrollPos) {
    // current scroll pos > previous scroll pos => user scrolled down
    this.classList.add("header-hide");
  } else {
    // current scroll pos <= prev scroll pos =>
    this.classList.remove("header-hide");
  }

  // update prev scroll pos with the current scroll pos
  prevScrollPos = this.scrollTop;
});

/**
 * Ripple effect
 */
const $rippleElems = document.querySelectorAll("[data-ripple]");

function createRipple(elem) {
  elem.addEventListener("pointerdown", function (event) {
    event.stopImmediatePropagation();

    const $rippleDiv = document.createElement("div");
    $rippleDiv.classList.add("ripple");
    this.appendChild($rippleDiv);

    const removeRippleDiv = () => {
      $rippleDiv.animate(
        {
          opacity: 0,
        },
        {
          fill: "forwards",
          duration: 200,
        }
      );

      setTimeout(() => $rippleDiv.remove(), 1000);
    };

    this.addEventListener("pointerup", removeRippleDiv, { once: true });
    this.addEventListener("pointerleave", removeRippleDiv, { once: true });

    // Ripple size and position
    const rippleDivSize = Math.max(this.clientWidth, this.clientHeight);
    $rippleDiv.style.width = `${rippleDivSize}px`;
    $rippleDiv.style.height = `${rippleDivSize}px`;

    // Position ripple at click coordinates, centered on the click point
    $rippleDiv.style.left = `${event.layerX - rippleDivSize / 2}px`;
    $rippleDiv.style.top = `${event.layerY - rippleDivSize / 2}px`;
  });
}

$rippleElems.forEach((elem) => createRipple(elem));

/**
 * Lazy loading animation
 */
window.addEventListener("DOMContentLoaded", () => {
  const $lazyImages = document.querySelectorAll("[data-lazy-loaded]");

  const fadeInImage = ($elem) => {
    $elem.animate({ opacity: 1 }, { duration: 200, fill: "forwards" });
  };

  $lazyImages.forEach(($img) => {
    $img.style.opacity = 0;

    if ($img.complete) {
      fadeInImage($img);
    } else {
      $img.addEventListener("load", () => fadeInImage($img));
    }
  });
});

/**
 * Bottom nav item active
 */
const $bottomNavItems = document.querySelectorAll("[data-bottom-nav-item]");
const $activeBottomNavItem = document.querySelector(
  "[data-bottom-nav-item].active"
);

function handleActiveBottomNavItem() {
  $activeBottomNavItem?.classList.remove("active");
  this.classList.add("active");
}

$bottomNavItems &&
  addEventListenersToElems($bottomNavItems, "click", handleActiveBottomNavItem);

/**
 * Copyright year
 */
const $copyrightYearSpan = document.querySelector("[data-copyright-year]");
$copyrightYearSpan.innerText = new Date().getFullYear().toString();

/**
 * Player modal toggle
 */
const $playerModal = document.querySelector("[data-player-modal]");
const $playerModalTogglers = document.querySelectorAll(
  "[data-player-modal-toggler]"
);
const $playerModalOverlay = document.querySelector(
  "[data-player-modal-overlay]"
);

function togglePlayerModal() {
  $playerModal.classList.toggle("active");
  $playerModalOverlay.classList.toggle("active");
}

$playerModalTogglers &&
  addEventListenersToElems($playerModalTogglers, "click", togglePlayerModal);

/**
 * Session history back and forward navigation
 */
const historyBackBtn = document.querySelector("[data-history-back-btn]");
const historyForwardBtn = document.querySelector("[data-history-forward-btn]");

historyBackBtn?.addEventListener("click", () => window.history.back());
historyForwardBtn?.addEventListener("click", () => window.history.forward());
