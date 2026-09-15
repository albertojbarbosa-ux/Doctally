import { useEffect, useRef, useState } from "react";
import { login, loginComGoogle, salvarSessao } from "../api/auth";
import LogoMark from "../assets/logo-mark.svg";

// Client ID do OAuth do Google não é secreto (é enviado ao navegador de qualquer forma),
// por isso o fallback fica direto no código em vez de exigir uma variável de ambiente.
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "293280603864-3810cpfbferfno3tjurp0ugdjgbp3oka.apps.googleusercontent.com";

export default function Login({ aoLogar, aoIrParaRegistro, aoIrParaEsqueciSenha }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const botaoGoogleRef = useRef(null);

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

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    async function aoReceberCredencialGoogle(resposta) {
      setErro(null);
      try {
        const sessao = await loginComGoogle(resposta.credential);
        salvarSessao(sessao);
        aoLogar();
      } catch (e) {
        setErro(e.message);
      }
    }

    let cancelado = false;
    function tentarInicializar() {
      if (cancelado) return;
      if (!window.google?.accounts?.id) {
        setTimeout(tentarInicializar, 100);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: aoReceberCredencialGoogle,
      });
      if (botaoGoogleRef.current) {
        window.google.accounts.id.renderButton(botaoGoogleRef.current, {
          theme: "outline",
          size: "large",
          width: 312,
          text: "signin_with",
          locale: "pt_BR",
        });
      }
    }
    tentarInicializar();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 360, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <img src={LogoMark} alt="" width={36} height={36} />
          <h1 style={{ fontFamily: "var(--font-brand)", fontSize: "2.1rem", fontWeight: 700, color: "var(--primary-dark)", lineHeight: 1 }}>Doctally</h1>
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
          <button
            type="button"
            onClick={aoIrParaEsqueciSenha}
            style={{ alignSelf: "flex-end", padding: 0, background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 500, cursor: "pointer" }}
          >
            Esqueci minha senha
          </button>
          {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}
          <button type="submit" disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</button>
        </form>

        {GOOGLE_CLIENT_ID && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>ou</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>
            <div ref={botaoGoogleRef} style={{ display: "flex", justifyContent: "center" }} />
          </>
        )}

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
