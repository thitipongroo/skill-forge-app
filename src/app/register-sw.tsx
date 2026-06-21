"use client";
import { useEffect } from "react";

// Registers the service worker so the app is installable (PWA) and can receive
// push notifications.
export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
