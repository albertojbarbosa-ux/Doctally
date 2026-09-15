const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function headers() {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listarPacientes(busca = "") {
  const url = new URL(`${API_URL}/api/pacientes`);
  if (busca) url.searchParams.set("busca", busca);
  const res = await fetch(url, { headers: headers() });
  if (res.status === 401) throw new Error("Sessão expirada, faça login novamente.");
  if (!res.ok) throw new Error("Falha ao listar pacientes");
  return res.json();
}

export async function criarPaciente(dados) {
  const res = await fetch(`${API_URL}/api/pacientes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error("Falha ao criar paciente");
  return res.json();
}

export async function obterPaciente(id) {
  const res = await fetch(`${API_URL}/api/pacientes/${id}`, { headers: headers() });
  if (res.status === 401) throw new Error("Sessão expirada, faça login novamente.");
  if (!res.ok) throw new Error("Falha ao carregar paciente");
  return res.json();
}

export async function atualizarPaciente(id, dados) {
  const res = await fetch(`${API_URL}/api/pacientes/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error("Falha ao salvar alterações do paciente");
}
