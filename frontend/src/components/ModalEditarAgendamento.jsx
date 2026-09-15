import { useState } from "react";
import { listarAgendamentos, atualizarAgendamento } from "../api/agendamentos";
import { gerarSlots, formatarDataISO } from "../utils/horarios";
import Modal from "./Modal";

export default function ModalEditarAgendamento({ agendamento, dataInicial, aoFechar, aoAtualizado }) {
  const [dataEscolhida, setDataEscolhida] = useState(formatarDataISO(dataInicial));
  const [horariosOcupados, setHorariosOcupados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  async function verHorarios() {
    if (!dataEscolhida) return;
    setCarregando(true);
    setErro(null);
    setHorariosOcupados(null);
    try {
      const agendamentos = await listarAgendamentos(dataEscolhida);
      // O próprio horário atual deste agendamento não conta como ocupado.
      setHorariosOcupados(new Set(agendamentos.filter((a) => a.id !== agendamento.id).map((a) => a.horario)));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function escolherHorario(horario) {
    setSalvando(true);
    setErro(null);
    try {
      await atualizarAgendamento(agendamento.id, { data: dataEscolhida, horario });
      aoAtualizado();
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  }

  const slots = gerarSlots(agendamento.duracaoMinutos);
  const ehDataOriginal = dataEscolhida === formatarDataISO(dataInicial);

  return (
    <Modal titulo="Editar agendamento" aoFechar={aoFechar}>
      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 0.9rem" }}>
        Paciente: <strong style={{ color: "var(--text)" }}>{agendamento.pacienteNome}</strong>
        <br />
        Atualmente em {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(dataInicial)} às {agendamento.horario}
      </p>

      <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
        <label style={{ flex: 1 }}>
          Novo dia
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
              const ehAtual = ehDataOriginal && horario === agendamento.horario;
              return (
                <button
                  key={horario}
                  type="button"
                  disabled={ocupado || salvando}
                  onClick={() => escolherHorario(horario)}
                  title={ehAtual ? "Horário atual deste agendamento" : undefined}
                  style={{
                    background: ehAtual ? "var(--primary-soft)" : ocupado ? "var(--bg)" : "transparent",
                    color: ocupado ? "var(--text-muted)" : "var(--text)",
                    border: ehAtual ? "1px solid var(--primary)" : "1px solid var(--border)",
                    fontSize: "0.82rem",
                    fontWeight: ehAtual ? 700 : 400,
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
