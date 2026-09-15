import { useState } from "react";
import { registrarClinica, salvarSessao } from "../api/auth";
import LogoMark from "../assets/logo-mark.svg";

const vazio = { nomeClinica: "", tipoPessoa: "Juridica", cnpj: "", cpf: "", nomeAdmin: "", emailAdmin: "", senha: "" };

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 420, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <img src={LogoMark} alt="" width={32} height={32} />
          <h1 style={{ fontSize: "1.3rem" }}>Cadastrar clínica</h1>
        </div>
        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <label>
            Nome da clínica
            <input required value={form.nomeClinica} onChange={(e) => atualizar("nomeClinica", e.target.value)} />
          </label>

          <div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Tipo de cadastro</span>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.35rem" }}>
              <button
                type="button"
                onClick={() => atualizar("tipoPessoa", "Juridica")}
                style={{
                  flex: 1,
                  background: form.tipoPessoa === "Juridica" ? "var(--primary)" : "transparent",
                  color: form.tipoPessoa === "Juridica" ? "#fff" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Pessoa jurídica (CNPJ)
              </button>
              <button
                type="button"
                onClick={() => atualizar("tipoPessoa", "Fisica")}
                style={{
                  flex: 1,
                  background: form.tipoPessoa === "Fisica" ? "var(--primary)" : "transparent",
                  color: form.tipoPessoa === "Fisica" ? "#fff" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                Pessoa física (CPF)
              </button>
            </div>
          </div>

          {form.tipoPessoa === "Juridica" ? (
            <label>
              CNPJ
              <input required value={form.cnpj} onChange={(e) => atualizar("cnpj", e.target.value)} />
            </label>
          ) : (
            <label>
              CPF
              <input required value={form.cpf} onChange={(e) => atualizar("cpf", e.target.value)} />
            </label>
          )}

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
          {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}
          <button type="submit" disabled={carregando}>{carregando ? "Criando..." : "Criar clínica"}</button>
        </form>
        <p style={{ marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Já tem conta?{" "}
          <button
            type="button"
            onClick={aoVoltarParaLogin}
            style={{ padding: 0, background: "none", border: "none", color: "var(--primary-dark)", fontWeight: 600, cursor: "pointer" }}
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
