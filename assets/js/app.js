import { clearSession, getCurrentUser, requireAuth, seedDemoData } from "./storage.js";
import { mountNavbar, setActiveNav } from "./ui.js";

function attachLogout() {
  const button = document.querySelector("#logoutButton");
  if (!button) return;
  button.addEventListener("click", () => {
    clearSession();
    window.location.href = "index.html";
  });
}

export function initProtectedPage(activeLinkId, onReady) {
  document.addEventListener("DOMContentLoaded", () => {
    seedDemoData();
    const session = requireAuth("index.html");
    if (!session) return;
    const user = getCurrentUser();
    mountNavbar(user);
    setActiveNav(activeLinkId);
    attachLogout();
    onReady?.(user);
  });
}
