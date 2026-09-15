const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function headers() {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listarAgendamentos(dataIso) {
  const res = await fetch(`${API_URL}/api/agendamentos?data=${dataIso}`, { headers: headers() });
  if (!res.ok) throw new Error("Falha ao carregar agenda");
  const dados = await res.json();
  // Normaliza "HH:mm:ss" (retorno do backend) pra "HH:mm" (usado no front).
  return dados.map((a) => ({ ...a, horario: a.horario.slice(0, 5) }));
}

export async function criarAgendamento({ pacienteId, data, horario, duracaoMinutos }) {
  const res = await fetch(`${API_URL}/api/agendamentos`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ pacienteId, data, horario: `${horario}:00`, duracaoMinutos }),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Falha ao agendar consulta.");
  }
  return res.json();
}

export async function atualizarAgendamento(id, { data, horario }) {
  const res = await fetch(`${API_URL}/api/agendamentos/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ data, horario: `${horario}:00` }),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Falha ao reagendar consulta.");
  }
  return res.json();
}

export async function cancelarAgendamento(id) {
  const res = await fetch(`${API_URL}/api/agendamentos/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Falha ao cancelar consulta.");
}
