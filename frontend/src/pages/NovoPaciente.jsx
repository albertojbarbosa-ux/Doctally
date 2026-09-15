import { useState } from "react";
import { criarPaciente } from "../api/pacientes";

const vazio = {
  // 1. Identificação pessoal
  nomeCompleto: "",
  dataNascimento: "",
  sexo: "",
  nomeMae: "",
  estadoCivil: "",
  naturalidadeMunicipio: "",
  naturalidadeUf: "",
  nacionalidade: "",
  profissao: "",
  grauInstrucao: "",
  // 2. Documentação
  cpf: "",
  rg: "",
  rgOrgaoEmissor: "",
  cns: "",
  convenio: "",
  numeroCarteirinha: "",
  validadeConvenio: "",
  // 3. Contatos
  telefone: "",
  telefoneFixo: "",
  email: "",
  comoConheceuClinica: "",
  // 4. Endereço residencial
  cep: "",
  logradouro: "",
  enderecoNumero: "",
  complemento: "",
  bairro: "",
  municipio: "",
  uf: "",
  pontoReferencia: "",
  // 5. Contato de emergência
  emergenciaNome: "",
  emergenciaParentesco: "",
  emergenciaTelefone: "",
  // 6. Responsável (menor/incapaz)
  responsavelNome: "",
  responsavelCpf: "",
  responsavelRg: "",
  responsavelParentesco: "",
  responsavelTelefone: "",
  // 7. Informações de saúde
  possuiAlergias: false,
  alergiasQuais: "",
  usaMedicacaoContinua: false,
  medicacaoQuais: "",
  statusTabagismo: "",
  tabagismoDetalhe: "",
  possuiDoencaCronica: false,
  doencaCronicaQuais: "",
  cirurgiasInternacoes: "",
  // 8. Consentimento
  consentimentoLgpd: false,
};

const CAMPOS_DATA = new Set(["validadeConvenio"]);

function Secao({ numero, titulo, subtitulo, children }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend style={{ padding: 0, marginBottom: "0.15rem", fontFamily: "var(--font-display)", fontSize: "1.02rem", fontWeight: 600, color: "var(--text)" }}>
        {numero}. {titulo}
      </legend>
      {subtitulo && <p style={{ margin: "0 0 0.85rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>{subtitulo}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem 1rem" }}>{children}</div>
    </fieldset>
  );
}

function Campo({ label, width, children }) {
  return (
    <label style={{ width: width || 220, flex: width === "100%" ? "1 1 100%" : `0 1 ${width || 220}px` }}>
      {label}
      {children}
    </label>
  );
}

function GrupoOpcoes({ label, opcoes, valor, onSelecionar }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {opcoes.map((op) => (
          <button
            key={op.valor}
            type="button"
            onClick={() => onSelecionar(op.valor)}
            style={{
              padding: "0.4rem 0.75rem",
              fontSize: "0.85rem",
              background: valor === op.valor ? "var(--primary)" : "transparent",
              color: valor === op.valor ? "#fff" : "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const OPCOES_SEXO = [
  { valor: "Masculino", label: "Masculino" },
  { valor: "Feminino", label: "Feminino" },
  { valor: "Outro", label: "Outro" },
  { valor: "PrefereNaoInformar", label: "Prefiro não informar" },
];
const OPCOES_ESTADO_CIVIL = [
  { valor: "Solteiro", label: "Solteiro" },
  { valor: "Casado", label: "Casado" },
  { valor: "Divorciado", label: "Divorciado" },
  { valor: "Viuvo", label: "Viúvo" },
  { valor: "UniaoEstavel", label: "União estável" },
];
const OPCOES_TABAGISMO = [
  { valor: "NuncaFumou", label: "Nunca fumou" },
  { valor: "Fumante", label: "Fumante" },
  { valor: "ExFumante", label: "Ex-fumante" },
];
const OPCOES_SIM_NAO = [
  { valor: "nao", label: "Não" },
  { valor: "sim", label: "Sim" },
];

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
      const payload = { ...form };
      // Campos de data opcionais vazios viram null (string vazia não é uma data válida).
      for (const campo of CAMPOS_DATA) {
        if (!payload[campo]) payload[campo] = null;
      }
      await criarPaciente(payload);
      aoSalvar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", maxWidth: 880 }}>
      <h2 style={{ fontSize: "1.15rem", marginBottom: "1.25rem" }}>Novo paciente</h2>
      <form onSubmit={enviar} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        <Secao numero={1} titulo="Identificação pessoal">
          <Campo label="Nome completo" width="100%">
            <input required value={form.nomeCompleto} onChange={(e) => atualizar("nomeCompleto", e.target.value)} />
          </Campo>
          <Campo label="Data de nascimento" width={160}>
            <input required type="date" value={form.dataNascimento} onChange={(e) => atualizar("dataNascimento", e.target.value)} />
          </Campo>
          <Campo label="Nome da mãe" width={280}>
            <input value={form.nomeMae} onChange={(e) => atualizar("nomeMae", e.target.value)} />
          </Campo>
          <Campo label="Naturalidade (município)" width={220}>
            <input value={form.naturalidadeMunicipio} onChange={(e) => atualizar("naturalidadeMunicipio", e.target.value)} />
          </Campo>
          <Campo label="UF" width={70}>
            <input maxLength={2} value={form.naturalidadeUf} onChange={(e) => atualizar("naturalidadeUf", e.target.value.toUpperCase())} />
          </Campo>
          <Campo label="Nacionalidade" width={180}>
            <input value={form.nacionalidade} onChange={(e) => atualizar("nacionalidade", e.target.value)} />
          </Campo>
          <Campo label="Profissão / ocupação" width={200}>
            <input value={form.profissao} onChange={(e) => atualizar("profissao", e.target.value)} />
          </Campo>
          <Campo label="Grau de instrução" width={200}>
            <input value={form.grauInstrucao} onChange={(e) => atualizar("grauInstrucao", e.target.value)} />
          </Campo>
          <GrupoOpcoes label="Sexo / gênero" opcoes={OPCOES_SEXO} valor={form.sexo} onSelecionar={(v) => atualizar("sexo", v)} />
          <GrupoOpcoes label="Estado civil" opcoes={OPCOES_ESTADO_CIVIL} valor={form.estadoCivil} onSelecionar={(v) => atualizar("estadoCivil", v)} />
        </Secao>

        <Secao numero={2} titulo="Documentação">
          <Campo label="CPF" width={160}>
            <input required value={form.cpf} onChange={(e) => atualizar("cpf", e.target.value)} />
          </Campo>
          <Campo label="RG" width={140}>
            <input value={form.rg} onChange={(e) => atualizar("rg", e.target.value)} />
          </Campo>
          <Campo label="Órgão emissor" width={110}>
            <input value={form.rgOrgaoEmissor} onChange={(e) => atualizar("rgOrgaoEmissor", e.target.value)} />
          </Campo>
          <Campo label="Cartão Nacional de Saúde (CNS/SUS)" width={220}>
            <input value={form.cns} onChange={(e) => atualizar("cns", e.target.value)} />
          </Campo>
          <Campo label="Convênio / plano de saúde" width={220}>
            <input value={form.convenio} onChange={(e) => atualizar("convenio", e.target.value)} />
          </Campo>
          <Campo label="Número da carteirinha" width={180}>
            <input value={form.numeroCarteirinha} onChange={(e) => atualizar("numeroCarteirinha", e.target.value)} />
          </Campo>
          <Campo label="Validade do plano" width={160}>
            <input type="date" value={form.validadeConvenio} onChange={(e) => atualizar("validadeConvenio", e.target.value)} />
          </Campo>
        </Secao>

        <Secao numero={3} titulo="Contatos">
          <Campo label="Celular / WhatsApp" width={170}>
            <input value={form.telefone} onChange={(e) => atualizar("telefone", e.target.value)} />
          </Campo>
          <Campo label="Telefone fixo" width={170}>
            <input value={form.telefoneFixo} onChange={(e) => atualizar("telefoneFixo", e.target.value)} />
          </Campo>
          <Campo label="E-mail" width={260}>
            <input type="email" value={form.email} onChange={(e) => atualizar("email", e.target.value)} />
          </Campo>
          <Campo label="Como conheceu a clínica / indicação" width={280}>
            <input value={form.comoConheceuClinica} onChange={(e) => atualizar("comoConheceuClinica", e.target.value)} />
          </Campo>
        </Secao>

        <Secao numero={4} titulo="Endereço residencial">
          <Campo label="CEP" width={120}>
            <input value={form.cep} onChange={(e) => atualizar("cep", e.target.value)} />
          </Campo>
          <Campo label="Logradouro (rua, av.)" width={320}>
            <input value={form.logradouro} onChange={(e) => atualizar("logradouro", e.target.value)} />
          </Campo>
          <Campo label="Número" width={90}>
            <input value={form.enderecoNumero} onChange={(e) => atualizar("enderecoNumero", e.target.value)} />
          </Campo>
          <Campo label="Complemento" width={160}>
            <input value={form.complemento} onChange={(e) => atualizar("complemento", e.target.value)} />
          </Campo>
          <Campo label="Bairro" width={200}>
            <input value={form.bairro} onChange={(e) => atualizar("bairro", e.target.value)} />
          </Campo>
          <Campo label="Município" width={220}>
            <input value={form.municipio} onChange={(e) => atualizar("municipio", e.target.value)} />
          </Campo>
          <Campo label="UF" width={70}>
            <input maxLength={2} value={form.uf} onChange={(e) => atualizar("uf", e.target.value.toUpperCase())} />
          </Campo>
          <Campo label="Ponto de referência" width="100%">
            <input value={form.pontoReferencia} onChange={(e) => atualizar("pontoReferencia", e.target.value)} />
          </Campo>
        </Secao>

        <Secao numero={5} titulo="Contato de emergência">
          <Campo label="Nome do contato" width={260}>
            <input value={form.emergenciaNome} onChange={(e) => atualizar("emergenciaNome", e.target.value)} />
          </Campo>
          <Campo label="Grau de parentesco" width={200}>
            <input value={form.emergenciaParentesco} onChange={(e) => atualizar("emergenciaParentesco", e.target.value)} />
          </Campo>
          <Campo label="Telefone de emergência" width={180}>
            <input value={form.emergenciaTelefone} onChange={(e) => atualizar("emergenciaTelefone", e.target.value)} />
          </Campo>
        </Secao>

        <Secao numero={6} titulo="Responsável" subtitulo="Preencher apenas se o paciente for menor de idade ou incapaz.">
          <Campo label="Nome do responsável" width={260}>
            <input value={form.responsavelNome} onChange={(e) => atualizar("responsavelNome", e.target.value)} />
          </Campo>
          <Campo label="CPF do responsável" width={160}>
            <input value={form.responsavelCpf} onChange={(e) => atualizar("responsavelCpf", e.target.value)} />
          </Campo>
          <Campo label="RG do responsável" width={140}>
            <input value={form.responsavelRg} onChange={(e) => atualizar("responsavelRg", e.target.value)} />
          </Campo>
          <Campo label="Grau de parentesco" width={180}>
            <input value={form.responsavelParentesco} onChange={(e) => atualizar("responsavelParentesco", e.target.value)} />
          </Campo>
          <Campo label="Telefone do responsável" width={180}>
            <input value={form.responsavelTelefone} onChange={(e) => atualizar("responsavelTelefone", e.target.value)} />
          </Campo>
        </Secao>

        <Secao numero={7} titulo="Informações de saúde / anamnese básica">
          <GrupoOpcoes
            label="Possui alergias?"
            opcoes={OPCOES_SIM_NAO}
            valor={form.possuiAlergias ? "sim" : "nao"}
            onSelecionar={(v) => atualizar("possuiAlergias", v === "sim")}
          />
          {form.possuiAlergias && (
            <Campo label="Quais alergias?" width={320}>
              <input value={form.alergiasQuais} onChange={(e) => atualizar("alergiasQuais", e.target.value)} />
            </Campo>
          )}

          <GrupoOpcoes
            label="Toma medicação de uso contínuo?"
            opcoes={OPCOES_SIM_NAO}
            valor={form.usaMedicacaoContinua ? "sim" : "nao"}
            onSelecionar={(v) => atualizar("usaMedicacaoContinua", v === "sim")}
          />
          {form.usaMedicacaoContinua && (
            <Campo label="Quais medicações?" width={320}>
              <input value={form.medicacaoQuais} onChange={(e) => atualizar("medicacaoQuais", e.target.value)} />
            </Campo>
          )}

          <GrupoOpcoes label="Tabagismo" opcoes={OPCOES_TABAGISMO} valor={form.statusTabagismo} onSelecionar={(v) => atualizar("statusTabagismo", v)} />
          {form.statusTabagismo && form.statusTabagismo !== "NuncaFumou" && (
            <Campo label="Tempo / quantidade" width={220}>
              <input value={form.tabagismoDetalhe} onChange={(e) => atualizar("tabagismoDetalhe", e.target.value)} />
            </Campo>
          )}

          <GrupoOpcoes
            label="Possui doença crônica (hipertensão, diabetes etc.)?"
            opcoes={OPCOES_SIM_NAO}
            valor={form.possuiDoencaCronica ? "sim" : "nao"}
            onSelecionar={(v) => atualizar("possuiDoencaCronica", v === "sim")}
          />
          {form.possuiDoencaCronica && (
            <Campo label="Quais doenças crônicas?" width={320}>
              <input value={form.doencaCronicaQuais} onChange={(e) => atualizar("doencaCronicaQuais", e.target.value)} />
            </Campo>
          )}

          <Campo label="Cirurgias prévias / internações" width="100%">
            <input value={form.cirurgiasInternacoes} onChange={(e) => atualizar("cirurgiasInternacoes", e.target.value)} />
          </Campo>
        </Secao>

        <Secao numero={8} titulo="Termo de consentimento (LGPD)">
          <label style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "0.5rem", width: "100%" }}>
            <input
              type="checkbox"
              checked={form.consentimentoLgpd}
              onChange={(e) => atualizar("consentimentoLgpd", e.target.checked)}
              style={{ width: "auto", marginTop: "0.2rem" }}
            />
            <span style={{ fontSize: "0.88rem", color: "var(--text)" }}>
              Declaro que os dados acima são verdadeiros e autorizo o tratamento de meus dados pessoais conforme a
              Lei Geral de Proteção de Dados (LGPD) para fins de atendimento de saúde e conformidade administrativa.
              A marcação deste campo, com data e hora registradas pelo sistema, vale como assinatura digital deste termo.
            </span>
          </label>
        </Secao>

        {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</button>
          <button type="button" onClick={aoCancelar}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
