import { useEffect, useState } from "react";
import { listarPacientes } from "../api/pacientes";
import { criarAgendamento } from "../api/agendamentos";
import { formatarDataISO } from "../utils/horarios";
import Modal from "./Modal";

export default function ModalAgendarHorario({ data, horario, duracaoMinutos, aoFechar, aoAgendado }) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [agendando, setAgendando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const termo = busca.trim();
    if (termo.length < 2) {
      setResultados([]);
      return;
    }
    let ativo = true;
    setBuscando(true);
    const id = setTimeout(() => {
      listarPacientes(termo)
        .then((r) => ativo && setResultados(r))
        .catch(() => ativo && setResultados([]))
        .finally(() => ativo && setBuscando(false));
    }, 300);
    return () => {
      ativo = false;
      clearTimeout(id);
    };
  }, [busca]);

  async function escolherPaciente(paciente) {
    setAgendando(true);
    setErro(null);
    try {
      await criarAgendamento({ pacienteId: paciente.id, data: formatarDataISO(data), horario, duracaoMinutos });
      aoAgendado();
    } catch (e) {
      setErro(e.message);
      setAgendando(false);
    }
  }

  return (
    <Modal titulo={`Agendar ${horario}`} aoFechar={aoFechar}>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 0.9rem" }}>
        {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(data)} às {horario} · {duracaoMinutos} min
      </p>

      <label>
        Buscar paciente
        <input
          autoFocus
          placeholder="Digite o nome do paciente"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          disabled={agendando}
        />
      </label>

      {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: "0.6rem 0 0" }}>{erro}</p>}

      <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {buscando && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Buscando...</p>}
        {!buscando && busca.trim().length >= 2 && resultados.length === 0 && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Nenhum paciente encontrado.</p>
        )}
        {resultados.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={agendando}
            onClick={() => escolherPaciente(p)}
            style={{
              textAlign: "left",
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "0.55rem 0.75rem",
            }}
          >
            <strong style={{ fontSize: "0.9rem" }}>{p.nomeCompleto}</strong>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>CPF: {p.cpf}</div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
