import { useEffect, useState } from "react";
import { listarPacientes } from "../api/pacientes";

function Card({ titulo, valor, legenda, cor }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1.1rem 1.25rem",
        flex: 1,
        minWidth: 200,
      }}
    >
      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>{titulo}</div>
      <div style={{ fontSize: "1.8rem", fontFamily: "var(--font-display)", color: cor ?? "var(--text)" }}>{valor}</div>
      {legenda && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{legenda}</div>}
    </div>
  );
}

function Painel({ titulo, subtitulo, children }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1.25rem",
        flex: 1,
        minWidth: 280,
      }}
    >
      <h3 style={{ fontSize: "1.05rem" }}>{titulo}</h3>
      {subtitulo && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.3rem 0 0.9rem" }}>{subtitulo}</p>}
      {children}
    </div>
  );
}

export default function Dashboard({ aoIrParaPacientes }) {
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarPacientes()
      .then(setPacientes)
      .catch(() => setPacientes([]))
      .finally(() => setCarregando(false));
  }, []);

  const semConsentimento = pacientes.filter((p) => !p.consentimentoLgpd).length;
  const hoje = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());

  return (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "stretch" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Card
            titulo="Pacientes cadastrados"
            valor={carregando ? "…" : pacientes.length}
            legenda="Total na clínica"
            cor="var(--primary-dark)"
          />
          <Card titulo="Consultas hoje" valor="0" legenda="Módulo de agenda ainda não disponível" />
          <Card
            titulo="Consentimento LGPD pendente"
            valor={carregando ? "…" : semConsentimento}
            legenda={semConsentimento > 0 ? "Requer atenção" : "Tudo em dia"}
            cor={semConsentimento > 0 ? "var(--danger)" : "var(--primary-dark)"}
          />
        </div>

        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <Painel titulo="Pacientes recentes" subtitulo="Últimos cadastrados na clínica">
            {carregando && <p style={{ color: "var(--text-muted)" }}>Carregando...</p>}
            {!carregando && pacientes.length === 0 && (
              <p style={{ color: "var(--text-muted)" }}>Nenhum paciente cadastrado ainda.</p>
            )}
            {!carregando && pacientes.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {pacientes.slice(0, 5).map((p) => (
                  <li key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                    <span>{p.nomeCompleto}</span>
                    <span style={{ color: "var(--text-muted)" }}>{p.convenio || "Particular"}</span>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={aoIrParaPacientes} style={{ marginTop: "1rem" }}>
              Ver todos os pacientes
            </button>
          </Painel>

          <Painel titulo="Próximos módulos" subtitulo="O que está a caminho no Doctally">
            <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.88rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <li>Receituário simples e controlado (assinatura ICP-Brasil)</li>
              <li>Faturamento</li>
              <li>Anamnese preenchida por IA a partir do áudio da consulta</li>
            </ul>
          </Painel>
        </div>
      </div>

      <div
        style={{
          width: 340,
          flexShrink: 0,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ fontSize: "1.05rem" }}>Agenda do dia</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.3rem 0 1rem" }}>{hoje}</p>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Agenda do médico em desenvolvimento — em breve você verá aqui os horários e consultas do dia.
          </p>
        </div>
      </div>
    </div>
  );
}
