/**
 * @license Apache-2.0
 * @copyright Dhrubajyoti Bhattacharjee 2025
 */

"use strict";

/**
 * Toast notification system
 */

let $toastContainer = document.querySelector(".toast-container");

if (!$toastContainer) {
  $toastContainer = document.createElement("div");
  $toastContainer.className = "toast-container";
  document.body.appendChild($toastContainer);
}

/**
 * Show a toast notification
 * @param {Object} options - Toast options
 * @param {string} options.message - Toast message
 * @param {string} [options.icon='error'] - Material icon name
 * @param {string} [options.action='Learn more'] - Action button text
 * @param {string} [options.link] - URL to open when clicked
 * @param {number} [options.duration=5000] - Duration in ms (0 for persistent)
 * @returns {HTMLElement} The toast element
 */
export function showToast({
  message,
  icon = "error",
  action = "Learn more",
  link,
  duration = 5000,
}) {
  // toast element
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="material-symbols-rounded toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    ${action ? `<span class="toast-action">${action}</span>` : ""}
    <div class="state-layer"></div>
  `;

  if (link) {
    toast.addEventListener("click", () => {
      window.open(link, "_blank", "noopener,noreferrer");
      hideToast(toast);
    });
  }

  $toastContainer.appendChild(toast);

  // trigger show animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // auto hide after duration
  if (duration > 0) {
    setTimeout(() => {
      hideToast(toast);
    }, duration);
  }

  return toast;
}

/**
 * Hide a toast notification
 * @param {HTMLElement} toast - Toast element to hide
 */
export function hideToast(toast) {
  toast.classList.remove("show");
  toast.classList.add("hide");

  // remove from DOM after animation
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
}

/**
 * Show Spotify Premium required toast
 */
export function showPremiumRequiredToast() {
  return showToast({
    message: "Spotify Premium required to play music",
    icon: "error",
    action: "Get Premium",
    link: "https://www.spotify.com/premium/",
    duration: 6000,
  });
}
