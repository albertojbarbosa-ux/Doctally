import { useEffect, useState } from "react";
import { listarModulos, iniciarCheckout, abrirPortalAssinatura } from "../api/billing";

const STATUS_LABEL = {
  Disponivel: { texto: "Disponível", cor: "var(--text-muted)" },
  Contratado: { texto: "Contratado", cor: "var(--primary-dark)" },
  Cortesia: { texto: "Cortesia", cor: "var(--primary-dark)" },
  PagamentoPendente: { texto: "Pagamento pendente", cor: "var(--danger)" },
};

function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Modulos() {
  const [modulos, setModulos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [processando, setProcessando] = useState(null);

  function carregar() {
    setCarregando(true);
    listarModulos()
      .then(setModulos)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  async function assinar(moduloChave) {
    setProcessando(moduloChave);
    setErro(null);
    try {
      await iniciarCheckout(moduloChave);
    } catch (e) {
      setErro(e.message);
      setProcessando(null);
    }
  }

  async function gerenciarAssinatura() {
    setErro(null);
    try {
      await abrirPortalAssinatura();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "var(--text-muted)", margin: 0 }}>
          Contrate os módulos que sua clínica precisa. Cobrança mensal recorrente via Stripe.
        </p>
        <button type="button" onClick={gerenciarAssinatura}>Gerenciar assinaturas</button>
      </div>

      {erro && <p style={{ color: "var(--danger)" }}>{erro}</p>}
      {carregando && <p style={{ color: "var(--text-muted)" }}>Carregando...</p>}

      <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
        {modulos.map((m) => {
          const status = STATUS_LABEL[m.status] ?? STATUS_LABEL.Disponivel;
          const bloqueado = m.status === "Disponivel";
          return (
            <div
              key={m.moduloId}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "1.25rem",
                flex: 1,
                minWidth: 260,
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 style={{ fontSize: "1.05rem" }}>{m.nome}</h3>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: status.cor }}>{status.texto}</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0, flex: 1 }}>{m.descricao}</p>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
                {formatarPreco(m.precoMensalCentavos)}<span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/mês</span>
              </div>
              {bloqueado && (
                <button type="button" onClick={() => assinar(m.chave)} disabled={processando === m.chave}>
                  {processando === m.chave ? "Redirecionando..." : "Assinar"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
