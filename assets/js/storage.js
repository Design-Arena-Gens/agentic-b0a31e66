const USERS_KEY = "ffRankingUsers";
const SESSION_KEY = "ffRankingSession";

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to parse stored users", err);
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getUsers() {
  return readUsers();
}

export function saveUser(user) {
  const users = readUsers();
  const exists = users.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (exists) {
    throw new Error("Este e-mail já está cadastrado.");
  }
  users.push(user);
  writeUsers(users);
  return user;
}

export function updateUser(email, updates) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) {
    throw new Error("Usuário não encontrado.");
  }
  users[idx] = { ...users[idx], ...updates, updatedAt: Date.now() };
  writeUsers(users);
  return users[idx];
}

export function getUserByEmail(email) {
  const users = readUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function authenticateUser(email, password) {
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error("E-mail ou senha inválidos.");
  }
  if (user.password !== password) {
    throw new Error("E-mail ou senha inválidos.");
  }
  return user;
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse session", err);
    return null;
  }
}

export function setSession(email) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      email,
      lastActiveAt: Date.now(),
    }),
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function requireAuth(redirect = "index.html") {
  const session = getSession();
  if (!session) {
    window.location.href = redirect;
  }
  return session;
}

export function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return getUserByEmail(session.email);
}

export function recordGameSession(email, { pointsEarned = 0, bestCombo = 0 }) {
  const current = getUserByEmail(email);
  if (!current) {
    throw new Error("Usuário não encontrado.");
  }
  const nextTotals = {
    points: Math.max(0, (current.points ?? 0) + pointsEarned),
    totalSessions: (current.totalSessions ?? 0) + 1,
    totalPointsEarned: (current.totalPointsEarned ?? 0) + pointsEarned,
    bestCombo: Math.max(current.bestCombo ?? 0, bestCombo),
  };
  return updateUser(email, nextTotals);
}

export function setUserAvatar(email, avatarVariant) {
  return updateUser(email, { avatarVariant });
}

export function leaderBoardData() {
  const users = readUsers();
  return [...users]
    .map((user) => ({
      ...user,
      rankScore: user.points ?? 0,
    }))
    .sort((a, b) => b.rankScore - a.rankScore);
}

export function seedDemoData() {
  if (readUsers().length > 0) return;
  const sample = [
    {
      username: "SombraFF",
      email: "sombra@example.com",
      password: "123456",
      points: 1270,
      totalPointsEarned: 1580,
      totalSessions: 42,
      bestCombo: 12,
      avatarVariant: "phoenix",
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
      updatedAt: Date.now(),
    },
    {
      username: "RainhaBattle",
      email: "rainha@example.com",
      password: "123456",
      points: 980,
      totalPointsEarned: 1460,
      totalSessions: 38,
      bestCombo: 9,
      avatarVariant: "blaze",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      updatedAt: Date.now(),
    },
    {
      username: "SniperX",
      email: "sniper@example.com",
      password: "123456",
      points: 865,
      totalPointsEarned: 1200,
      totalSessions: 30,
      bestCombo: 10,
      avatarVariant: "sparks",
      createdAt: Date.now() - 1000 * 60 * 60 * 5,
      updatedAt: Date.now(),
    },
  ];
  writeUsers(sample);
}
