import { useState } from "react";
import { login, salvarSessao } from "../api/auth";
import LogoMark from "../assets/logo-mark.svg";

export default function Login({ aoLogar, aoIrParaRegistro }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const sessao = await login(email, senha);
      salvarSessao(sessao);
      aoLogar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 360, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <img src={LogoMark} alt="" width={32} height={32} />
          <h1 style={{ fontSize: "1.3rem" }}>Doctally</h1>
        </div>
        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <label>
            E-mail
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Senha
            <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
          </label>
          {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}
          <button type="submit" disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</button>
        </form>
        <p style={{ marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Ainda não tem uma clínica cadastrada?{" "}
          <button
            type="button"
            onClick={aoIrParaRegistro}
            style={{ padding: 0, background: "none", border: "none", color: "var(--primary-dark)", fontWeight: 600, cursor: "pointer" }}
          >
            Cadastrar clínica
          </button>
        </p>
      </div>
    </div>
  );
}
