export function showInlineMessage(target, { type = "success", message }) {
  if (!target) return;
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  alert.role = "alert";
  alert.innerHTML = `<span>${message}</span>`;
  target.innerHTML = "";
  target.appendChild(alert);
  setTimeout(() => {
    alert.classList.add("fade-out");
    alert.addEventListener("animationend", () => {
      if (alert.parentElement === target) {
        target.removeChild(alert);
      }
    });
  }, 4000);
}

export function setActiveNav(linkId) {
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    if (link.dataset.linkId === linkId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

export function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(value ?? 0);
}

export function formatRelativeDate(timestamp) {
  if (!timestamp) return "agora";
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.round(diff / (1000 * 60));
  if (minutes < 1) return "agora";
  if (minutes === 1) return "há 1 minuto";
  if (minutes < 60) return `há ${minutes} minutos`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return "há 1 hora";
  if (hours < 24) return `há ${hours} horas`;
  const days = Math.round(hours / 24);
  if (days === 1) return "há 1 dia";
  return `há ${days} dias`;
}

export function mountNavbar(user) {
  const navSlot = document.querySelector("[data-slot='navbar']");
  if (!navSlot) return;
  const username = user?.username ?? "Convidado";
  navSlot.innerHTML = `
    <nav class="navbar">
      <div class="brand">
        <span>Ranking de Contas FF</span>
        <span class="badge">Ranking diário</span>
      </div>
      <div class="nav-links">
        <a class="nav-link" data-link-id="profile" href="profile.html">Perfil</a>
        <a class="nav-link" data-link-id="ranking" href="ranking.html">Ranking</a>
        <a class="nav-link" data-link-id="minigame" href="minigame.html">Minigame</a>
      </div>
      <div class="nav-links">
        <span class="badge">Jogador: ${username}</span>
        <button class="button button-ghost" id="logoutButton">Sair</button>
      </div>
    </nav>
  `;
}
