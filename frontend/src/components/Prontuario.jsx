import { useState } from "react";
import LogoMark from "../assets/logo-mark.svg";

const SECOES = [
  { id: "anamnese", label: "Anamnese", icone: "◉" },
  { id: "exames", label: "Exames", icone: "▥" },
  { id: "procedimentos", label: "Procedimentos", icone: "✚" },
  { id: "receitas", label: "Receitas", icone: "✎" },
];

function ConteudoSecao({ titulo }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 240,
        textAlign: "center",
      }}
    >
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: 360 }}>
        {titulo} em desenvolvimento — em breve esta seção do prontuário fica disponível aqui.
      </p>
    </div>
  );
}

export default function Prontuario({ pacienteId, pacienteNome, aoFechar }) {
  const [secaoAtiva, setSecaoAtiva] = useState("anamnese");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", background: "var(--bg)" }}>
      <aside
        style={{
          width: 232,
          background: "var(--sidebar-bg)",
          padding: "1.25rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0 0.25rem" }}>
          <img src={LogoMark} alt="" width={30} height={30} />
          <span style={{ fontFamily: "var(--font-brand)", fontSize: "1.5rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
            Doctally
          </span>
        </div>

        <div
          style={{
            background: "var(--surface)",
            borderRadius: 10,
            padding: "0.75rem 0.85rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.15rem",
          }}
        >
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Prontuário
          </span>
          <strong style={{ fontSize: "0.9rem" }}>{pacienteNome}</strong>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {SECOES.map((secao) => {
            const ativo = secaoAtiva === secao.id;
            return (
              <button
                key={secao.id}
                type="button"
                onClick={() => setSecaoAtiva(secao.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: 8,
                  border: "none",
                  background: ativo ? "var(--sidebar-active-bg)" : "transparent",
                  color: ativo ? "var(--primary-dark)" : "var(--sidebar-text)",
                  fontWeight: ativo ? 700 : 500,
                  fontSize: "0.9rem",
                  textAlign: "left",
                }}
              >
                <span aria-hidden style={{ width: 18, textAlign: "center" }}>{secao.icone}</span>
                {secao.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={aoFechar}
          style={{ marginTop: "auto", textAlign: "left", color: "var(--danger)", border: "none", background: "transparent", padding: "0.5rem 0.75rem" }}
        >
          ✕ Fechar prontuário
        </button>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.75rem",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <h1 style={{ fontSize: "1.3rem" }}>{SECOES.find((s) => s.id === secaoAtiva)?.label}</h1>
        </header>

        <main style={{ flex: 1, padding: "1.75rem", overflowY: "auto" }}>
          <ConteudoSecao titulo={SECOES.find((s) => s.id === secaoAtiva)?.label} />
        </main>
      </div>
    </div>
  );
}
