import { useState } from "react";
import { registrarClinica, salvarSessao } from "../api/auth";

const vazio = { nomeClinica: "", cnpj: "", nomeAdmin: "", emailAdmin: "", senha: "" };

export default function RegistrarClinica({ aoRegistrar, aoVoltarParaLogin }) {
  const [form, setForm] = useState(vazio);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const sessao = await registrarClinica(form);
      salvarSessao(sessao);
      aoRegistrar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "3rem auto", padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.4rem" }}>Cadastrar clínica no Doctally</h1>
      <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Nome da clínica
          <input required value={form.nomeClinica} onChange={(e) => atualizar("nomeClinica", e.target.value)} />
        </label>
        <label>
          CNPJ
          <input required value={form.cnpj} onChange={(e) => atualizar("cnpj", e.target.value)} />
        </label>
        <label>
          Seu nome (administrador)
          <input required value={form.nomeAdmin} onChange={(e) => atualizar("nomeAdmin", e.target.value)} />
        </label>
        <label>
          E-mail de acesso
          <input type="email" required value={form.emailAdmin} onChange={(e) => atualizar("emailAdmin", e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" required minLength={8} value={form.senha} onChange={(e) => atualizar("senha", e.target.value)} />
        </label>
        {erro && <p style={{ color: "crimson" }}>{erro}</p>}
        <button type="submit" disabled={carregando}>{carregando ? "Criando..." : "Criar clínica"}</button>
      </form>
      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        Já tem conta?{" "}
        <button type="button" onClick={aoVoltarParaLogin} style={{ padding: 0, background: "none", border: "none", color: "#0645AD", cursor: "pointer" }}>
          Entrar
        </button>
      </p>
    </div>
  );
}
