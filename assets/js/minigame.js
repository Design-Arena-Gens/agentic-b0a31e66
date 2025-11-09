import { initProtectedPage } from "./app.js";
import { recordGameSession, getUserByEmail } from "./storage.js";
import { formatNumber } from "./ui.js";

const GAME_DURATION = 30;
const TARGET_MOVE_INTERVAL = 1500;

function randomPosition(container, target) {
  const { width, height } = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const maxX = width - targetRect.width;
  const maxY = height - targetRect.height;
  const x = Math.max(0, Math.random() * maxX);
  const y = Math.max(0, Math.random() * maxY);
  target.style.transform = `translate(${x}px, ${y}px)`;
}

function createGameState(user) {
  return {
    user,
    score: 0,
    combo: 0,
    bestCombo: 0,
    timeLeft: GAME_DURATION,
    isRunning: false,
    lastHitAt: 0,
    timerId: null,
    moverId: null,
  };
}

function updateHUD(state) {
  const scoreEl = document.querySelector("#gameScore");
  const comboEl = document.querySelector("#gameCombo");
  const timerEl = document.querySelector("#gameTimer");
  const scoreHud = document.querySelector("#gameScoreHud");
  const comboHud = document.querySelector("#gameComboHud");
  const timerHud = document.querySelector("#gameTimerHud");
  if (scoreEl) scoreEl.textContent = formatNumber(state.score);
  if (comboEl) comboEl.textContent = `${state.combo}x`;
  if (timerEl) timerEl.textContent = `${state.timeLeft}s`;
  if (scoreHud) scoreHud.textContent = formatNumber(state.score);
  if (comboHud) comboHud.textContent = `${state.combo}x`;
  if (timerHud) timerHud.textContent = `${state.timeLeft}s`;
}

function showOverlay(message, subtitle, actions) {
  const overlay = document.querySelector("#gameOverlay");
  if (!overlay) return;
  overlay.innerHTML = `
    <h2 class="page-title" style="font-size:32px;">${message}</h2>
    <p class="page-subtitle" style="text-align:center;">${subtitle}</p>
    <div class="nav-links" style="gap:16px;">
      ${actions ?? ""}
    </div>
  `;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  const overlay = document.querySelector("#gameOverlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
}

function finishGame(state) {
  state.isRunning = false;
  clearInterval(state.timerId);
  clearInterval(state.moverId);
  const target = document.querySelector("#gameTarget");
  if (target) {
    target.classList.add("hidden");
  }
  const pointsEarned = state.score;
  const bestCombo = state.bestCombo;
  recordGameSession(state.user.email, { pointsEarned, bestCombo });
  state.user = getUserByEmail(state.user.email);
  showOverlay(
    "Partida Concluída!",
    `Você faturou ${formatNumber(pointsEarned)} pontos e combo máximo ${bestCombo}x.`,
    `
      <button class="button button-secondary" id="playAgain">Jogar Novamente</button>
      <a class="button" href="profile.html">Voltar ao Perfil</a>
    `,
  );
  const playAgain = document.querySelector("#playAgain");
  playAgain?.addEventListener("click", () => {
    hideOverlay();
    startGame(state);
  });
}

function startGame(state) {
  clearInterval(state.timerId);
  clearInterval(state.moverId);
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.timeLeft = GAME_DURATION;
  state.isRunning = true;
  state.lastHitAt = 0;
  updateHUD(state);
  hideOverlay();

  const target = document.querySelector("#gameTarget");
  const container = document.querySelector("#gameArena");
  if (!target || !container) return;
  target.classList.remove("hidden");
  target.textContent = "DROP";
  randomPosition(container, target);

  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    updateHUD(state);
    if (state.timeLeft <= 0) {
      finishGame(state);
    }
  }, 1000);

  state.moverId = setInterval(() => {
    randomPosition(container, target);
  }, TARGET_MOVE_INTERVAL);
}

function registerTargetHit(state) {
  if (!state.isRunning) return;
  const now = Date.now();
  if (now - state.lastHitAt <= 1500) {
    state.combo += 1;
  } else {
    state.combo = 1;
  }
  state.lastHitAt = now;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  const points = 50 + state.combo * 10;
  state.score += points;
  updateHUD(state);

  const target = document.querySelector("#gameTarget");
  const container = document.querySelector("#gameArena");
  if (target && container) {
    target.textContent = `+${points}`;
    randomPosition(container, target);
    setTimeout(() => {
      if (state.isRunning && target) {
        target.textContent = "DROP";
      }
    }, 400);
  }
}

initProtectedPage("minigame", (user) => {
  const state = createGameState(user);
  const target = document.querySelector("#gameTarget");
  target?.addEventListener("click", () => registerTargetHit(state));
  showOverlay(
    "Caça às Caixas!",
    "Clique nas caixas antes que sumam para conquistar pontos e combos épicos!",
    `<button class="button" id="beginGame">Começar</button>`,
  );
  document.querySelector("#beginGame")?.addEventListener("click", () => {
    startGame(state);
  });
  updateHUD(state);
});
