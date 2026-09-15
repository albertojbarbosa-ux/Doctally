const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function headers() {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function listarModulos() {
  const res = await fetch(`${API_URL}/api/billing/modulos`, { headers: headers() });
  if (!res.ok) throw new Error("Falha ao carregar módulos");
  return res.json();
}

export async function iniciarCheckout(moduloChave) {
  const res = await fetch(`${API_URL}/api/billing/checkout`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ moduloChave }),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Não foi possível iniciar a contratação.");
  }
  const { urlCheckout } = await res.json();
  window.location.href = urlCheckout;
}

export async function abrirPortalAssinatura() {
  const res = await fetch(`${API_URL}/api/billing/portal`, { method: "POST", headers: headers() });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(texto || "Não foi possível abrir o portal de assinatura.");
  }
  const { urlPortal } = await res.json();
  window.location.href = urlPortal;
}
