const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function login(email, senha) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) throw new Error("E-mail ou senha inválidos");
  return res.json();
}

export async function registrarClinica(dados) {
  const res = await fetch(`${API_URL}/api/auth/registrar-clinica`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Falha ao registrar clínica");
  }
  return res.json();
}

export async function loginComGoogle(idToken) {
  const res = await fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Não foi possível entrar com Google.");
  }
  return res.json();
}

export async function solicitarResetSenha(email) {
  const res = await fetch(`${API_URL}/api/auth/esqueci-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Não foi possível processar a solicitação. Tente novamente.");
  return res.json();
}

export async function redefinirSenha(token, novaSenha) {
  const res = await fetch(`${API_URL}/api/auth/redefinir-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, novaSenha }),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Link de redefinição inválido ou expirado.");
  }
  return res.json();
}

export function salvarSessao({ token, nome, papel, clinicaId, ehSuperAdmin }) {
  localStorage.setItem("token", token);
  localStorage.setItem("nome", nome);
  localStorage.setItem("papel", papel);
  localStorage.setItem("clinicaAtivaId", clinicaId);
  localStorage.setItem("ehSuperAdmin", ehSuperAdmin ? "1" : "0");
}

export function sessaoAtual() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    token,
    nome: localStorage.getItem("nome"),
    papel: localStorage.getItem("papel"),
    clinicaId: localStorage.getItem("clinicaAtivaId"),
    ehSuperAdmin: localStorage.getItem("ehSuperAdmin") === "1",
  };
}

export function sair() {
  localStorage.removeItem("token");
  localStorage.removeItem("nome");
  localStorage.removeItem("papel");
  localStorage.removeItem("clinicaAtivaId");
  localStorage.removeItem("ehSuperAdmin");
}
