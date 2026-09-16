const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function headers() {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listarPerguntasAnamnese() {
  const res = await fetch(`${API_URL}/api/anamnese/perguntas-padrao`, { headers: headers() });
  if (!res.ok) throw new Error("Falha ao carregar roteiro de anamnese");
  return res.json();
}

export async function criarAtendimento(pacienteId) {
  const res = await fetch(`${API_URL}/api/pacientes/${pacienteId}/atendimentos`, {
    method: "POST",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Falha ao iniciar atendimento");
  return res.json();
}

export async function atualizarAtendimento(id, dados) {
  const res = await fetch(`${API_URL}/api/atendimentos/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error("Falha ao salvar anamnese");
}

export async function processarAnamneseIa(atendimentoId, transcricao, perguntasPendentesIds) {
  const res = await fetch(`${API_URL}/api/atendimentos/${atendimentoId}/anamnese-ia/processar`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ transcricao, perguntasPendentesIds }),
  });
  if (!res.ok) throw new Error("Falha ao processar anamnese com IA");
  return res.json();
}
