import { useMemo, useState } from "react";

const DURACOES = [10, 15, 20, 30];
const INICIO_EXPEDIENTE_MIN = 8 * 60; // 08:00
const FIM_EXPEDIENTE_MIN = 18 * 60; // 18:00
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function gerarSlots(duracaoMin) {
  const slots = [];
  for (let m = INICIO_EXPEDIENTE_MIN; m < FIM_EXPEDIENTE_MIN; m += duracaoMin) {
    const h = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    slots.push(`${h}:${mm}`);
  }
  return slots;
}

function mesmoDia(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function gerarSemanasDoMes(dataRef) {
  const ano = dataRef.getFullYear();
  const mes = dataRef.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  const dias = [];
  // Preenche os espaços antes do dia 1 (semana começa no domingo).
  for (let i = 0; i < primeiroDia.getDay(); i++) dias.push(null);
  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) dias.push(new Date(ano, mes, dia));
  while (dias.length % 7 !== 0) dias.push(null);

  const semanas = [];
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));
  return semanas;
}

function BotaoSeta({ onClick, children, titulo }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={titulo}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        color: "var(--text)",
        width: 26,
        height: 26,
        padding: 0,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.9rem",
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

export default function AgendaDoDia() {
  const [modo, setModo] = useState("dia"); // "dia" | "mes"
  const [dataAtual, setDataAtual] = useState(new Date());
  const [duracaoConsulta, setDuracaoConsulta] = useState(30);

  const hoje = new Date();
  const slots = useMemo(() => gerarSlots(duracaoConsulta), [duracaoConsulta]);
  const semanas = useMemo(() => (modo === "mes" ? gerarSemanasDoMes(dataAtual) : []), [modo, dataAtual]);

  function navegar(direcao) {
    setDataAtual((d) => {
      const nova = new Date(d);
      if (modo === "dia") nova.setDate(nova.getDate() + direcao);
      else nova.setMonth(nova.getMonth() + direcao);
      return nova;
    });
  }

  function irParaHoje() {
    setDataAtual(new Date());
  }

  function selecionarDia(dia) {
    setDataAtual(dia);
    setModo("dia");
  }

  const rotulo =
    modo === "dia"
      ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(dataAtual)
      : new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(dataAtual);

  return (
    <div
      style={{
        flex: "0 0 33%",
        height: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <h3 style={{ fontSize: "1.05rem", whiteSpace: "nowrap" }}>Agenda do dia</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <BotaoSeta onClick={() => navegar(-1)} titulo={modo === "dia" ? "Dia anterior" : "Mês anterior"}>
            ‹
          </BotaoSeta>
          <button
            type="button"
            onClick={irParaHoje}
            title="Ir para hoje"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              padding: 0,
              fontSize: "0.78rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {rotulo}
          </button>
          <BotaoSeta onClick={() => navegar(1)} titulo={modo === "dia" ? "Próximo dia" : "Próximo mês"}>
            ›
          </BotaoSeta>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", margin: "0.85rem 0" }}>
        <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {[
            { id: "dia", label: "Dia" },
            { id: "mes", label: "Mês" },
          ].map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setModo(opcao.id)}
              style={{
                background: modo === opcao.id ? "var(--primary)" : "transparent",
                color: modo === opcao.id ? "#fff" : "var(--text-muted)",
                border: "none",
                borderRadius: 0,
                fontSize: "0.78rem",
                padding: "0.35rem 0.7rem",
              }}
            >
              {opcao.label}
            </button>
          ))}
        </div>

        {modo === "dia" && (
          <select
            value={duracaoConsulta}
            onChange={(e) => setDuracaoConsulta(Number(e.target.value))}
            title="Duração de cada consulta"
            style={{ fontSize: "0.78rem", padding: "0.3rem 0.4rem" }}
          >
            {DURACOES.map((d) => (
              <option key={d} value={d}>{d} min</option>
            ))}
          </select>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {modo === "dia" ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {slots.map((horario) => (
              <li
                key={horario}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.28rem 0.1rem",
                  borderBottom: "1px solid var(--border)",
                  fontSize: "0.85rem",
                }}
              >
                <span style={{ color: "var(--text-muted)", width: 42, flexShrink: 0 }}>{horario}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Disponível</span>
              </li>
            ))}
          </ul>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr>
                {DIAS_SEMANA.map((d) => (
                  <th key={d} style={{ padding: "0.3rem 0", color: "var(--text-muted)", fontWeight: 500 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {semanas.map((semana, i) => (
                <tr key={i}>
                  {semana.map((dia, j) => {
                    const ehHoje = dia && mesmoDia(dia, hoje);
                    return (
                      <td key={j} style={{ padding: "0.15rem", textAlign: "center" }}>
                        {dia && (
                          <button
                            type="button"
                            onClick={() => selecionarDia(dia)}
                            style={{
                              width: 28,
                              height: 28,
                              padding: 0,
                              borderRadius: "50%",
                              border: "none",
                              background: ehHoje ? "var(--primary)" : "transparent",
                              color: ehHoje ? "#fff" : "var(--text)",
                              fontWeight: ehHoje ? 700 : 500,
                              fontSize: "0.78rem",
                            }}
                          >
                            {dia.getDate()}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
