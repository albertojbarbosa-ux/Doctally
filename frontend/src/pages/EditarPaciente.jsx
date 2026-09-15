import { useEffect, useState } from "react";
import { obterPaciente, atualizarPaciente } from "../api/pacientes";
import PacienteCampos, { pacienteVazio, pacienteParaFormulario, CAMPOS_DATA_PACIENTE } from "../components/PacienteCampos";

export default function EditarPaciente({ pacienteId, aoSalvar, aoCancelar }) {
  const [form, setForm] = useState(pacienteVazio);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    obterPaciente(pacienteId)
      .then((p) => ativo && setForm(pacienteParaFormulario(p)))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [pacienteId]);

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    if (!form.consentimentoLgpd) {
      setErro("É necessário registrar o consentimento do paciente para tratamento de dados de saúde (LGPD).");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const payload = { ...form };
      for (const campo of CAMPOS_DATA_PACIENTE) {
        if (!payload[campo]) payload[campo] = null;
      }
      await atualizarPaciente(pacienteId, payload);
      aoSalvar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem 1.75rem", width: "100%" }}>
      {carregando && <p style={{ color: "var(--text-muted)" }}>Carregando...</p>}

      {!carregando && (
        <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <PacienteCampos form={form} atualizar={atualizar} />

          {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar alterações"}</button>
            <button type="button" onClick={aoCancelar}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
