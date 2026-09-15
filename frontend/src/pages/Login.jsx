import { useState } from "react";
import { login, salvarSessao } from "../api/auth";

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
    <div style={{ maxWidth: 360, margin: "4rem auto", padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.4rem" }}>Entrar no Doctally</h1>
      <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          E-mail
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha
          <input type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <p style={{ color: "crimson" }}>{erro}</p>}
        <button type="submit" disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</button>
      </form>
      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        Ainda não tem uma clínica cadastrada?{" "}
        <button type="button" onClick={aoIrParaRegistro} style={{ padding: 0, background: "none", border: "none", color: "#0645AD", cursor: "pointer" }}>
          Cadastrar clínica
        </button>
      </p>
    </div>
  );
}
