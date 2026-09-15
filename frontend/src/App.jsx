import { useState } from "react";
import { sessaoAtual, sair } from "./api/auth";
import Login from "./pages/Login";
import RegistrarClinica from "./pages/RegistrarClinica";
import ListaPacientes from "./pages/ListaPacientes";
import NovoPaciente from "./pages/NovoPaciente";

export default function App() {
  const [sessao, setSessao] = useState(sessaoAtual());
  const [telaPublica, setTelaPublica] = useState("login"); // "login" | "registro"
  const [tela, setTela] = useState("lista"); // "lista" | "novo" (pós-login)

  if (!sessao) {
    if (telaPublica === "registro") {
      return (
        <RegistrarClinica
          aoRegistrar={() => setSessao(sessaoAtual())}
          aoVoltarParaLogin={() => setTelaPublica("login")}
        />
      );
    }
    return (
      <Login
        aoLogar={() => setSessao(sessaoAtual())}
        aoIrParaRegistro={() => setTelaPublica("registro")}
      />
    );
  }

  function fazerLogout() {
    sair();
    setSessao(null);
    setTelaPublica("login");
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", padding: "0.5rem 1.5rem", fontSize: "0.85rem" }}>
        <span>{sessao.nome} · {sessao.papel}</span>
        <button onClick={fazerLogout} style={{ padding: 0, background: "none", border: "none", color: "#0645AD", cursor: "pointer" }}>
          Sair
        </button>
      </div>

      {tela === "novo" ? (
        <NovoPaciente aoSalvar={() => setTela("lista")} aoCancelar={() => setTela("lista")} />
      ) : (
        <ListaPacientes aoSelecionarNovo={() => setTela("novo")} />
      )}
    </div>
  );
}
