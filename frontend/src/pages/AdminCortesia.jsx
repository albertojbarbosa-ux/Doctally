import { useState } from "react";
import { listarClinicas, obterModulosDaClinica, concederCortesia, revogarCortesia } from "../api/admin";

export default function AdminCortesia() {
  const [busca, setBusca] = useState("");
  const [clinicas, setClinicas] = useState([]);
  const [clinicaSelecionada, setClinicaSelecionada] = useState(null);
  const [modulosClinica, setModulosClinica] = useState([]);
  const [chaveNova, setChaveNova] = useState("prontuarios");
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function buscar(e) {
    e?.preventDefault();
    setErro(null);
    try {
      setClinicas(await listarClinicas(busca));
    } catch (e) {
      setErro(e.message);
    }
  }

  async function selecionar(clinica) {
    setClinicaSelecionada(clinica);
    setErro(null);
    try {
      setModulosClinica(await obterModulosDaClinica(clinica.clinicaId));
    } catch (e) {
      setErro(e.message);
    }
  }

  async function conceder(e) {
    e.preventDefault();
    if (!clinicaSelecionada) return;
    setCarregando(true);
    setErro(null);
    try {
      await concederCortesia(clinicaSelecionada.clinicaId, { moduloChave: chaveNova, motivo });
      setMotivo("");
      setModulosClinica(await obterModulosDaClinica(clinicaSelecionada.clinicaId));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function revogar(moduloId) {
    if (!clinicaSelecionada) return;
    setErro(null);
    try {
      await revogarCortesia(clinicaSelecionada.clinicaId, moduloId);
      setModulosClinica(await obterModulosDaClinica(clinicaSelecionada.clinicaId));
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", flex: 1, minWidth: 280 }}>
        <h3 style={{ fontSize: "1.05rem", marginBottom: "0.85rem" }}>Buscar clínica</h3>
        <form onSubmit={buscar} style={{ display: "flex", gap: "0.5rem" }}>
          <input placeholder="Nome, CNPJ ou CPF" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ flex: 1 }} />
          <button type="submit">Buscar</button>
        </form>
        <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0 0", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {clinicas.map((c) => (
            <li key={c.clinicaId}>
              <button
                type="button"
                onClick={() => selecionar(c)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: clinicaSelecionada?.clinicaId === c.clinicaId ? "var(--primary-soft)" : "transparent",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              >
                {c.nome} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>({c.cnpj || c.cpf})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {clinicaSelecionada && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", flex: 1, minWidth: 320 }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "0.85rem" }}>Módulos — {clinicaSelecionada.nome}</h3>

          {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{erro}</p>}

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {modulosClinica.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Nenhum módulo contratado ou cedido.</p>}
            {modulosClinica.map((m) => (
              <li key={m.moduloId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                <div>
                  <strong>{m.nome}</strong>{" "}
                  <span style={{ color: "var(--text-muted)" }}>
                    ({m.origem === "Cortesia" ? `cortesia — ${m.motivoCortesia}` : `assinatura, ${m.status}`})
                  </span>
                </div>
                {m.origem === "Cortesia" && !m.ativoAte && (
                  <button type="button" onClick={() => revogar(m.moduloId)} style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
                    Revogar
                  </button>
                )}
              </li>
            ))}
          </ul>

          <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>Conceder cortesia</h4>
          <form onSubmit={conceder} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <label>
              Módulo
              <select value={chaveNova} onChange={(e) => setChaveNova(e.target.value)}>
                <option value="prontuarios">Prontuário Eletrônico</option>
                <option value="receitas">Receituário</option>
                <option value="faturamento">Faturamento</option>
              </select>
            </label>
            <label>
              Motivo (obrigatório)
              <input required value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="ex: parceria, demo comercial" />
            </label>
            <button type="submit" disabled={carregando}>{carregando ? "Concedendo..." : "Conceder cortesia"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
