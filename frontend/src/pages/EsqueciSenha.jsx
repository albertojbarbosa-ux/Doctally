import { useState } from "react";
import { solicitarResetSenha } from "../api/auth";
import LogoMark from "../assets/logo-mark.svg";

export default function EsqueciSenha({ aoVoltarParaLogin }) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      await solicitarResetSenha(email);
      setEnviado(true);
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
          <h1 style={{ fontSize: "1.3rem" }}>Esqueci minha senha</h1>
        </div>

        {enviado ? (
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Se o e-mail <strong>{email}</strong> estiver cadastrado, você vai receber instruções para redefinir sua senha em instantes.
          </p>
        ) : (
          <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
              Informe o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha.
            </p>
            <label>
              E-mail
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}
            <button type="submit" disabled={carregando}>{carregando ? "Enviando..." : "Enviar link de redefinição"}</button>
          </form>
        )}

        <p style={{ marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <button
            type="button"
            onClick={aoVoltarParaLogin}
            style={{ padding: 0, background: "none", border: "none", color: "var(--primary-dark)", fontWeight: 600, cursor: "pointer" }}
          >
            Voltar para o login
          </button>
        </p>
      </div>
    </div>
  );
}
