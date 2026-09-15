import { useState } from "react";
import { redefinirSenha } from "../api/auth";
import LogoMark from "../assets/logo-mark.svg";

export default function RedefinirSenha({ token, aoConcluir }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (novaSenha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      await redefinirSenha(token, novaSenha);
      setConcluido(true);
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
          <h1 style={{ fontSize: "1.3rem" }}>Nova senha</h1>
        </div>

        {concluido ? (
          <>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
              Sua senha foi redefinida com sucesso.
            </p>
            <button type="button" onClick={aoConcluir}>Ir para o login</button>
          </>
        ) : (
          <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <label>
              Nova senha
              <input type="password" required minLength={8} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
            </label>
            <label>
              Confirmar nova senha
              <input type="password" required minLength={8} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
            </label>
            {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}
            <button type="submit" disabled={carregando}>{carregando ? "Salvando..." : "Redefinir senha"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
