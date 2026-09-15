import { useEffect, useState } from "react";
import { listarPacientes } from "../api/pacientes";

export default function ListaPacientes({ aoSelecionarNovo }) {
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
          <li key={p.id} style={{ padding: "0.85rem 0", borderBottom: "1px solid var(--border)" }}>
            <strong>{p.nomeCompleto}</strong>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              CPF: {p.cpf} · Nascimento: {p.dataNascimento}
            </div>
          </li>
        ))}
        {!carregando && pacientes.length === 0 && <p style={{ color: "var(--text-muted)" }}>Nenhum paciente cadastrado ainda.</p>}
      </ul>
    </div>
  );
}
