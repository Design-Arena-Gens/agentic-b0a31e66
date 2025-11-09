import { initProtectedPage } from "./app.js";
import { leaderBoardData, getCurrentUser } from "./storage.js";
import { formatNumber, formatRelativeDate } from "./ui.js";

function nextResetTimestamp() {
  const now = new Date();
  const reset = new Date(now);
  reset.setHours(23, 59, 59, 999);
  return reset.getTime();
}

function renderCountdown() {
  const timer = document.querySelector("#resetCountdown");
  if (!timer) return;
  const diff = nextResetTimestamp() - Date.now();
  if (diff <= 0) {
    timer.textContent = "Ranking reiniciado!";
    return;
  }
  const totalSeconds = Math.floor(diff / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  timer.textContent = `${hours}:${minutes}:${seconds}`;
}

function decorateRow(row, index) {
  if (index === 0) row.classList.add("top-spot");
  if (index === 1) row.classList.add("top-spot");
  if (index === 2) row.classList.add("top-spot");
}

function renderLeaderboard(filter = "top") {
  const tableBody = document.querySelector("#leaderboardBody");
  const current = getCurrentUser();
  const rows = leaderBoardData();
  const filtered = filter === "all" ? rows : rows.slice(0, 10);
  tableBody.innerHTML = "";
  filtered.forEach((user, index) => {
    const row = document.createElement("tr");
    if (current && user.email === current.email) {
      row.classList.add("highlight");
    }
    decorateRow(row, index);
    const medal =
      index === 0
        ? '<span class="pill gold">1º</span>'
        : index === 1
          ? '<span class="pill silver">2º</span>'
          : index === 2
            ? '<span class="pill bronze">3º</span>'
            : `#${index + 1}`;
    row.innerHTML = `
      <td>${medal}</td>
      <td>
        <div>${user.username}</div>
        <small class="helper-text">Atualizado ${formatRelativeDate(user.updatedAt)}</small>
      </td>
      <td>${formatNumber(user.points ?? 0)}</td>
      <td>${formatNumber(user.totalSessions ?? 0)}</td>
      <td>${formatNumber(user.bestCombo ?? 0)}</td>
    `;
    tableBody.appendChild(row);
  });

  const totalPlayers = document.querySelector("#totalPlayers");
  if (totalPlayers) {
    totalPlayers.textContent = formatNumber(rows.length);
  }
  const yourRank = current ? rows.findIndex((item) => item.email === current.email) + 1 : 0;
  const yourRankEl = document.querySelector("#yourRank");
  if (yourRankEl) {
    yourRankEl.textContent = yourRank ? `#${yourRank}` : "-";
  }
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const filter = tab.dataset.filter;
      renderLeaderboard(filter);
    });
  });
}

initProtectedPage("ranking", () => {
  renderLeaderboard("top");
  setupTabs();
  setInterval(renderCountdown, 1000);
  renderCountdown();
});
