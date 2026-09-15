import { useEffect, useState } from "react";
import { sessaoAtual, sair } from "./api/auth";
import { listarModulos } from "./api/billing";
import Login from "./pages/Login";
import RegistrarClinica from "./pages/RegistrarClinica";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Dashboard from "./pages/Dashboard";
import ListaPacientes from "./pages/ListaPacientes";
import NovoPaciente from "./pages/NovoPaciente";
import EditarPaciente from "./pages/EditarPaciente";
import Modulos from "./pages/Modulos";
import AdminCortesia from "./pages/AdminCortesia";
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

function lerRetornoCheckout() {
  const params = new URLSearchParams(window.location.search);
  return params.get("checkout"); // "sucesso" | "cancelado" | null
}

function limparRetornoCheckoutDaUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("checkout");
  window.history.replaceState({}, "", url.pathname + url.search);
}

export default function App() {
  const [sessao, setSessao] = useState(sessaoAtual());
  const tokenResetUrl = lerTokenResetDaUrl();
  const [telaPublica, setTelaPublica] = useState(
    tokenResetUrl ? "redefinir" : "login"
  ); // "login" | "registro" | "esqueci" | "redefinir"
  const [pagina, setPagina] = useState("dashboard"); // "dashboard" | "pacientes" | "novoPaciente" | "editarPaciente" | "modulos" | "adminCortesia"
  const [pacienteEditandoId, setPacienteEditandoId] = useState(null);
  const [entitlements, setEntitlements] = useState([]);
  const [avisoCheckout, setAvisoCheckout] = useState(lerRetornoCheckout());

  useEffect(() => {
    if (!sessao) return;
    listarModulos().then(setEntitlements).catch(() => setEntitlements([]));
  }, [sessao]);

  useEffect(() => {
    if (avisoCheckout) limparRetornoCheckoutDaUrl();
  }, [avisoCheckout]);

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
    setEntitlements([]);
  }

  function recarregarEntitlements() {
    listarModulos().then(setEntitlements).catch(() => {});
  }

  function renderizarConteudo() {
    if (pagina === "novoPaciente") {
      return <NovoPaciente aoSalvar={() => setPagina("pacientes")} aoCancelar={() => setPagina("pacientes")} />;
    }
    if (pagina === "editarPaciente") {
      return (
        <EditarPaciente
          pacienteId={pacienteEditandoId}
          aoSalvar={() => setPagina("pacientes")}
          aoCancelar={() => setPagina("pacientes")}
        />
      );
    }
    if (pagina === "pacientes") {
      return (
        <ListaPacientes
          aoSelecionarNovo={() => setPagina("novoPaciente")}
          aoSelecionarPaciente={(id) => {
            setPacienteEditandoId(id);
            setPagina("editarPaciente");
          }}
        />
      );
    }
    if (pagina === "modulos") {
      return <Modulos />;
    }
    if (pagina === "adminCortesia" && sessao.ehSuperAdmin) {
      return <AdminCortesia />;
    }
    return <Dashboard aoIrParaPacientes={() => setPagina("pacientes")} />;
  }

  return (
    <Layout
      paginaAtiva={pagina === "novoPaciente" || pagina === "editarPaciente" ? "pacientes" : pagina}
      aoNavegar={(destino) => {
        setPagina(destino);
        if (destino === "modulos") recarregarEntitlements();
      }}
      sessao={sessao}
      aoSair={fazerLogout}
      entitlements={entitlements}
    >
      {avisoCheckout && (
        <div
          style={{
            background: avisoCheckout === "sucesso" ? "var(--primary-soft)" : "var(--accent-soft)",
            color: "var(--text)",
            borderRadius: 10,
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            fontSize: "0.9rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {avisoCheckout === "sucesso"
              ? "Assinatura iniciada! Pode levar alguns instantes para o módulo aparecer liberado."
              : "Contratação cancelada — nenhuma cobrança foi feita."}
          </span>
          <button type="button" onClick={() => { setAvisoCheckout(null); recarregarEntitlements(); }} style={{ padding: "0.2rem 0.6rem" }}>
            Fechar
          </button>
        </div>
      )}
      {renderizarConteudo()}
    </Layout>
  );
}
