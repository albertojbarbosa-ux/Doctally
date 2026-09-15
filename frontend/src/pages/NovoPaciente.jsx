import { useState } from "react";
import { criarPaciente } from "../api/pacientes";

const vazio = {
  nomeCompleto: "",
  cpf: "",
  dataNascimento: "",
  telefone: "",
  email: "",
  convenio: "",
  numeroCarteirinha: "",
  consentimentoLgpd: false,
};

export default function NovoPaciente({ aoSalvar, aoCancelar }) {
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

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
      await criarPaciente(form);
      aoSalvar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", maxWidth: 480 }}>
      <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Novo paciente</h2>
      <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        <label>
          Nome completo
          <input required value={form.nomeCompleto} onChange={(e) => atualizar("nomeCompleto", e.target.value)} />
        </label>
        <label>
          CPF
          <input required value={form.cpf} onChange={(e) => atualizar("cpf", e.target.value)} />
        </label>
        <label>
          Data de nascimento
          <input required type="date" value={form.dataNascimento} onChange={(e) => atualizar("dataNascimento", e.target.value)} />
        </label>
        <label>
          Telefone
          <input value={form.telefone} onChange={(e) => atualizar("telefone", e.target.value)} />
        </label>
        <label>
          E-mail
          <input type="email" value={form.email} onChange={(e) => atualizar("email", e.target.value)} />
        </label>
        <label>
          Convênio
          <input value={form.convenio} onChange={(e) => atualizar("convenio", e.target.value)} />
        </label>
        <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={form.consentimentoLgpd}
            onChange={(e) => atualizar("consentimentoLgpd", e.target.checked)}
            style={{ width: "auto" }}
          />
          <span>Paciente autorizou o tratamento de seus dados de saúde (LGPD)</span>
        </label>

        {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          <button type="button" onClick={aoCancelar}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
