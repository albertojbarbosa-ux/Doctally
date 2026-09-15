import { useState } from "react";
import { sessaoAtual, sair } from "./api/auth";
import Login from "./pages/Login";
import RegistrarClinica from "./pages/RegistrarClinica";
import Dashboard from "./pages/Dashboard";
import ListaPacientes from "./pages/ListaPacientes";
import NovoPaciente from "./pages/NovoPaciente";
import Layout from "./components/Layout";

export default function App() {
  const [sessao, setSessao] = useState(sessaoAtual());
  const [telaPublica, setTelaPublica] = useState("login"); // "login" | "registro"
  const [pagina, setPagina] = useState("dashboard"); // "dashboard" | "pacientes" | "novoPaciente"

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
    setPagina("dashboard");
  }

  function renderizarConteudo() {
    if (pagina === "novoPaciente") {
      return <NovoPaciente aoSalvar={() => setPagina("pacientes")} aoCancelar={() => setPagina("pacientes")} />;
    }
    if (pagina === "pacientes") {
      return <ListaPacientes aoSelecionarNovo={() => setPagina("novoPaciente")} />;
    }
    return <Dashboard aoIrParaPacientes={() => setPagina("pacientes")} />;
  }

  return (
    <Layout
      paginaAtiva={pagina === "novoPaciente" ? "pacientes" : pagina}
      aoNavegar={setPagina}
      sessao={sessao}
      aoSair={fazerLogout}
    >
      {renderizarConteudo()}
    </Layout>
  );
}
