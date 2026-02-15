import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
// Suppress noisy ResizeObserver loop errors in development
if (typeof window !== "undefined") {
  const original = console.error;
  console.error = function (...args) {
    if (args && args[0] && typeof args[0] === "string" && args[0].includes("ResizeObserver loop completed")) {
      return;
    }
    original.apply(console, args);
  };

  // Prevent React error overlay from triggering on benign ResizeObserver loops
  window.addEventListener(
    "error",
    (e) => {
      const msg = e?.message || "";
      if (typeof msg === "string" && msg.includes("ResizeObserver loop completed")) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    },
    true
  );

  // As a last resort, hide/remove dev overlays that may still appear
  const hideOverlay = () => {
    const ids = [
      'webpack-dev-server-client-overlay', // webpack overlay id (div or iframe)
      'react-error-overlay', // legacy react overlay id
    ];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.remove?.();
      }
    });
    // Also hide iframes with the same id
    const ifr = document.querySelector('iframe#webpack-dev-server-client-overlay');
    if (ifr) {
      ifr.style.display = 'none';
      ifr.remove?.();
    }
  };
  // Try a few times during startup, then periodically
  hideOverlay();
  const overlayInterval = setInterval(hideOverlay, 500);
  setTimeout(() => clearInterval(overlayInterval), 5000);
}

root.render(<App />);
