import { useState } from "react";
import { listarAgendamentos, criarAgendamento } from "../api/agendamentos";
import { gerarSlots, formatarDataISO } from "../utils/horarios";
import Modal from "./Modal";

const DURACAO_PADRAO = 30;

function hojeISO() {
  return formatarDataISO(new Date());
}

export default function ModalAgendarPaciente({ pacienteId, pacienteNome, aoFechar, aoAgendado }) {
  const [dataEscolhida, setDataEscolhida] = useState(hojeISO());
  const [horariosOcupados, setHorariosOcupados] = useState(null); // null = ainda não buscou
  const [carregando, setCarregando] = useState(false);
  const [agendando, setAgendando] = useState(false);
  const [erro, setErro] = useState(null);

  async function verHorarios() {
    if (!dataEscolhida) return;
    setCarregando(true);
    setErro(null);
    setHorariosOcupados(null);
    try {
      const agendamentos = await listarAgendamentos(dataEscolhida);
      setHorariosOcupados(new Set(agendamentos.map((a) => a.horario)));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function escolherHorario(horario) {
    setAgendando(true);
    setErro(null);
    try {
      await criarAgendamento({ pacienteId, data: dataEscolhida, horario, duracaoMinutos: DURACAO_PADRAO });
      aoAgendado();
    } catch (e) {
      setErro(e.message);
      setAgendando(false);
    }
  }

  const slots = gerarSlots(DURACAO_PADRAO);

  return (
    <Modal titulo="Agendar consulta" aoFechar={aoFechar}>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 0.9rem" }}>Paciente: <strong style={{ color: "var(--text)" }}>{pacienteNome}</strong></p>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
        <label style={{ flex: 1 }}>
          Dia da consulta
          <input type="date" value={dataEscolhida} onChange={(e) => { setDataEscolhida(e.target.value); setHorariosOcupados(null); }} />
        </label>
        <button type="button" onClick={verHorarios} disabled={!dataEscolhida || carregando}>
          {carregando ? "Buscando..." : "Ver horários"}
        </button>
      </div>

      {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: "0.75rem 0 0" }}>{erro}</p>}

      {horariosOcupados && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 0.5rem" }}>
            Horários disponíveis em {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${dataEscolhida}T00:00:00`))}:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem" }}>
            {slots.map((horario) => {
              const ocupado = horariosOcupados.has(horario);
              return (
                <button
                  key={horario}
                  type="button"
                  disabled={ocupado || agendando}
                  onClick={() => escolherHorario(horario)}
                  style={{
                    background: ocupado ? "var(--bg)" : "transparent",
                    color: ocupado ? "var(--text-muted)" : "var(--text)",
                    border: "1px solid var(--border)",
                    fontSize: "0.82rem",
                    padding: "0.4rem 0",
                    textDecoration: ocupado ? "line-through" : "none",
                  }}
                >
                  {horario}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
