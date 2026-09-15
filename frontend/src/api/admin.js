const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function headers() {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listarClinicas(busca = "") {
  const url = new URL(`${API_URL}/api/admin/clinicas`);
  if (busca) url.searchParams.set("busca", busca);
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error("Falha ao listar clínicas");
  return res.json();
}

export async function obterModulosDaClinica(clinicaId) {
  const res = await fetch(`${API_URL}/api/admin/clinicas/${clinicaId}/modulos`, { headers: headers() });
  if (!res.ok) throw new Error("Falha ao carregar módulos da clínica");
  return res.json();
}

export async function concederCortesia(clinicaId, dados) {
  const res = await fetch(`${API_URL}/api/admin/clinicas/${clinicaId}/cortesia`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Falha ao conceder cortesia.");
  }
}

export async function revogarCortesia(clinicaId, moduloId) {
  const res = await fetch(`${API_URL}/api/admin/clinicas/${clinicaId}/cortesia/${moduloId}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Falha ao revogar cortesia.");
  }
}
