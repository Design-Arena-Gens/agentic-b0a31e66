import { initProtectedPage } from "./app.js";
import { setUserAvatar, leaderBoardData, getUserByEmail } from "./storage.js";
import { formatNumber, formatRelativeDate, showInlineMessage } from "./ui.js";

const AVATAR_THEMES = {
  phoenix: {
    label: "Phoenix",
    gradient: "linear-gradient(135deg, rgba(249, 115, 22, 0.8), rgba(252, 165, 165, 0.4))",
  },
  blaze: {
    label: "Blaze",
    gradient: "linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(251, 191, 36, 0.4))",
  },
  sparks: {
    label: "Sparks",
    gradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.8), rgba(129, 140, 248, 0.35))",
  },
  frost: {
    label: "Frost",
    gradient: "linear-gradient(135deg, rgba(59, 130, 246, 0.75), rgba(14, 165, 233, 0.4))",
  },
};

function applyAvatarTheme(element, variant) {
  const theme = AVATAR_THEMES[variant] ?? AVATAR_THEMES.phoenix;
  element.style.background = theme.gradient;
}

function renderProfile(user) {
  const leaderboard = leaderBoardData();
  const rank = leaderboard.findIndex((item) => item.email === user.email) + 1;
  const topPlayer = leaderboard[0];
  const avatar = document.querySelector("#profileAvatar");
  const initials = (user.username ?? user.email).slice(0, 2).toUpperCase();
  if (avatar) {
    avatar.textContent = initials;
    applyAvatarTheme(avatar, user.avatarVariant);
  }

  document.querySelector("[data-field='username']").textContent = user.username;
  document.querySelector("[data-field='email']").textContent = user.email;
  document.querySelector("[data-field='points']").textContent = formatNumber(user.points ?? 0);
  document.querySelector("[data-field='total-earned']").textContent = formatNumber(user.totalPointsEarned ?? 0);
  document.querySelector("[data-field='sessions']").textContent = formatNumber(user.totalSessions ?? 0);
  document.querySelector("[data-field='best-combo']").textContent = formatNumber(user.bestCombo ?? 0);
  document.querySelector("[data-field='ranking-position']").textContent = `#${rank || "-"}`;
  document.querySelector("[data-field='last-update']").textContent = formatRelativeDate(user.updatedAt);

  const delta = topPlayer ? Math.max(0, (topPlayer.points ?? 0) - (user.points ?? 0)) : 0;
  document.querySelector("[data-field='points-to-top']").textContent = formatNumber(delta);

  const target = 1500;
  const progress = Math.min(100, Math.round(((user.points ?? 0) / target) * 100));
  const bar = document.querySelector(".progress-bar");
  if (bar) {
    bar.style.width = `${progress}%`;
    bar.ariaValueNow = progress;
  }
  const progressLabel = document.querySelector("[data-field='progress-label']");
  if (progressLabel) {
    progressLabel.textContent = `${progress}% da meta diária (1.500 pts)`;
  }
}

function setupAvatarForm(user) {
  const form = document.querySelector("#avatarForm");
  const feedback = document.querySelector("#avatarFeedback");
  if (!form) return;
  form.elements.avatar.value = user.avatarVariant ?? "phoenix";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const choice = formData.get("avatar");
    try {
      setUserAvatar(user.email, choice);
      const refreshed = getUserByEmail(user.email);
      renderProfile(refreshed);
      showInlineMessage(feedback, {
        type: "success",
        message: "Avatar atualizado com sucesso!",
      });
    } catch (err) {
      showInlineMessage(feedback, {
        type: "error",
        message: err.message ?? "Não foi possível atualizar agora.",
      });
    }
  });
}

initProtectedPage("profile", (user) => {
  renderProfile(user);
  setupAvatarForm(user);
});
