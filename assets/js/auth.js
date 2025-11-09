import { authenticateUser, saveUser, seedDemoData, setSession } from "./storage.js";
import { showInlineMessage } from "./ui.js";

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const feedback = form.querySelector(".form-feedback");

  try {
    const user = authenticateUser(email, password);
    setSession(user.email);
    showInlineMessage(feedback, { type: "success", message: "Login realizado! Redirecionando..." });
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 800);
  } catch (err) {
    showInlineMessage(feedback, { type: "error", message: err.message });
  }
}

function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const confirm = form.confirm.value.trim();
  const feedback = form.querySelector(".form-feedback");

  if (!username || !email || !password) {
    showInlineMessage(feedback, { type: "error", message: "Preencha todos os campos." });
    return;
  }
  if (password.length < 6) {
    showInlineMessage(feedback, { type: "error", message: "A senha deve ter pelo menos 6 caracteres." });
    return;
  }
  if (password !== confirm) {
    showInlineMessage(feedback, { type: "error", message: "As senhas não conferem." });
    return;
  }

  try {
    const newUser = {
      username,
      email,
      password,
      points: 0,
      totalPointsEarned: 0,
      totalSessions: 0,
      bestCombo: 0,
      avatarVariant: "phoenix",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveUser(newUser);
    setSession(newUser.email);
    showInlineMessage(feedback, {
      type: "success",
      message: "Cadastro concluído! Vamos configurar o seu perfil.",
    });
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 900);
  } catch (err) {
    showInlineMessage(feedback, { type: "error", message: err.message });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  seedDemoData();
  const loginForm = document.querySelector("#loginForm");
  const registerForm = document.querySelector("#registerForm");

  loginForm?.addEventListener("submit", handleLogin);
  registerForm?.addEventListener("submit", handleRegister);
});
