import { useEffect, useState } from "react";
import { listarPacientes } from "../api/pacientes";

export default function ListaPacientes({ aoSelecionarNovo, aoSelecionarPaciente }) {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    listarPacientes(busca)
      .then((dados) => ativo && setPacientes(dados))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [busca]);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <input
          placeholder="Buscar por nome ou CPF"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ width: 280 }}
        />
        <button onClick={aoSelecionarNovo}>+ Novo paciente</button>
      </header>

      {carregando && <p style={{ color: "var(--text-muted)" }}>Carregando...</p>}
      {erro && <p style={{ color: "var(--danger)" }}>{erro}</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {pacientes.map((p) => (
          <li key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
            <button
              type="button"
              onClick={() => aoSelecionarPaciente(p.id)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.85rem 0.25rem",
                background: "transparent",
                border: "none",
                borderRadius: 6,
                color: "var(--text)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <strong style={{ fontSize: "0.95rem" }}>{p.nomeCompleto}</strong>
              <div style={{ fontSize: "0.85rem", fontWeight: 400, color: "var(--text-muted)" }}>
                CPF: {p.cpf} · Nascimento: {p.dataNascimento}
              </div>
            </button>
          </li>
        ))}
        {!carregando && pacientes.length === 0 && <p style={{ color: "var(--text-muted)" }}>Nenhum paciente cadastrado ainda.</p>}
      </ul>
    </div>
  );
}
