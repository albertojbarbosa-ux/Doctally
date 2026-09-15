import { useState } from "react";
import { sessaoAtual, sair } from "./api/auth";
import Login from "./pages/Login";
import RegistrarClinica from "./pages/RegistrarClinica";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Dashboard from "./pages/Dashboard";
import ListaPacientes from "./pages/ListaPacientes";
import NovoPaciente from "./pages/NovoPaciente";
import Layout from "./components/Layout";

function lerTokenResetDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

function limparTokenDaUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("token");
  window.history.replaceState({}, "", url.pathname + url.search);
}

export default function App() {
  const [sessao, setSessao] = useState(sessaoAtual());
  const tokenResetUrl = lerTokenResetDaUrl();
  const [telaPublica, setTelaPublica] = useState(
    tokenResetUrl ? "redefinir" : "login"
  ); // "login" | "registro" | "esqueci" | "redefinir"
  const [pagina, setPagina] = useState("dashboard"); // "dashboard" | "pacientes" | "novoPaciente"

  if (!sessao) {
    if (telaPublica === "redefinir") {
      return (
        <RedefinirSenha
          token={tokenResetUrl}
          aoConcluir={() => {
            limparTokenDaUrl();
            setTelaPublica("login");
          }}
        />
      );
    }
    if (telaPublica === "esqueci") {
      return <EsqueciSenha aoVoltarParaLogin={() => setTelaPublica("login")} />;
    }
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
        aoIrParaEsqueciSenha={() => setTelaPublica("esqueci")}
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
