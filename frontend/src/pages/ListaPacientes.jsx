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
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.4rem" }}>Pacientes</h1>
        <button onClick={aoSelecionarNovo}>+ Novo paciente</button>
      </header>

      <input
        placeholder="Buscar por nome ou CPF"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", margin: "1rem 0" }}
      />

      {carregando && <p>Carregando...</p>}
      {erro && <p style={{ color: "crimson" }}>{erro}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {pacientes.map((p) => (
          <li key={p.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid #ddd" }}>
            <strong>{p.nomeCompleto}</strong>
            <div style={{ fontSize: "0.85rem", color: "#555" }}>
              CPF: {p.cpf} · Nascimento: {p.dataNascimento}
            </div>
          </li>
        ))}
        {!carregando && pacientes.length === 0 && <p>Nenhum paciente cadastrado ainda.</p>}
      </ul>
    </div>
  );
}
