import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
if (typeof window !== "undefined") {
  const original = console.error;
  console.error = function (...args) {
    if (args && args[0] && typeof args[0] === "string" && args[0].includes("ResizeObserver loop completed")) {
      return;
    }
    original.apply(console, args);
  };

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

  const hideOverlay = () => {
    const ids = [
      'webpack-dev-server-client-overlay',
      'react-error-overlay',
    ];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.remove?.();
      }
    });
    const ifr = document.querySelector('iframe#webpack-dev-server-client-overlay');
    if (ifr) {
      ifr.style.display = 'none';
      ifr.remove?.();
    }
  };
  hideOverlay();
  const overlayInterval = setInterval(hideOverlay, 500);
  setTimeout(() => clearInterval(overlayInterval), 5000);
}

root.render(<App />);
