// Campos do cadastro de paciente, compartilhados entre NovoPaciente e EditarPaciente.

export const pacienteVazio = {
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

export const CAMPOS_DATA_PACIENTE = ["validadeConvenio"];

// Converte a resposta da API (PacienteResponse) pro formato do estado do formulário —
// null vira "" pra não disparar o aviso do React de campo controlado ficando undefined.
export function pacienteParaFormulario(p) {
  const form = { ...pacienteVazio };
  for (const chave of Object.keys(form)) {
    form[chave] = p[chave] ?? form[chave];
  }
  return form;
}

function Secao({ numero, titulo, subtitulo, children }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend style={{ padding: 0, marginBottom: "0.1rem", fontFamily: "var(--font-display)", fontSize: "1.02rem", fontWeight: 600, color: "var(--text)" }}>
        {numero}. {titulo}
      </legend>
      {subtitulo && <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>{subtitulo}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.5rem 1rem" }}>{children}</div>
    </fieldset>
  );
}

// span: quantas das 12 colunas do grid o campo ocupa — dimensiona pelo tipo de dado
// (UF/número curtos ocupam pouco, nome/endereço ocupam mais) e se adapta à largura
// disponível porque as colunas são frações fluidas, não pixels fixos.
function Campo({ label, span = 3, children }) {
  return (
    <label style={{ gridColumn: `span ${Math.min(span, 12)}`, minWidth: 0 }}>
      {label}
      {children}
    </label>
  );
}

function CampoSelecao({ label, span = 3, valor, onChange, opcoes, placeholder = "Selecione" }) {
  return (
    <Campo label={label} span={span}>
      <select value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {opcoes.map((op) => (
          <option key={op.valor} value={op.valor}>{op.label}</option>
        ))}
      </select>
    </Campo>
  );
}

function CampoSimNao({ label, span = 3, valor, onChange }) {
  return (
    <CampoSelecao
      label={label}
      span={span}
      valor={valor ? "sim" : "nao"}
      onChange={(v) => onChange(v === "sim")}
      opcoes={[{ valor: "nao", label: "Não" }, { valor: "sim", label: "Sim" }]}
      placeholder="Selecione"
    />
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

export default function PacienteCampos({ form, atualizar }) {
  return (
    <>
      <Secao numero={1} titulo="Identificação pessoal">
        <Campo label="Nome completo" span={12}>
          <input required value={form.nomeCompleto} onChange={(e) => atualizar("nomeCompleto", e.target.value)} />
        </Campo>
        <Campo label="Data de nascimento" span={2}>
          <input required type="date" value={form.dataNascimento} onChange={(e) => atualizar("dataNascimento", e.target.value)} />
        </Campo>
        <Campo label="Nome da mãe" span={4}>
          <input value={form.nomeMae} onChange={(e) => atualizar("nomeMae", e.target.value)} />
        </Campo>
        <Campo label="Naturalidade (município)" span={3}>
          <input value={form.naturalidadeMunicipio} onChange={(e) => atualizar("naturalidadeMunicipio", e.target.value)} />
        </Campo>
        <Campo label="UF" span={1}>
          <input maxLength={2} value={form.naturalidadeUf} onChange={(e) => atualizar("naturalidadeUf", e.target.value.toUpperCase())} />
        </Campo>
        <Campo label="Nacionalidade" span={2}>
          <input value={form.nacionalidade} onChange={(e) => atualizar("nacionalidade", e.target.value)} />
        </Campo>
        <Campo label="Profissão / ocupação" span={3}>
          <input value={form.profissao} onChange={(e) => atualizar("profissao", e.target.value)} />
        </Campo>
        <Campo label="Grau de instrução" span={3}>
          <input value={form.grauInstrucao} onChange={(e) => atualizar("grauInstrucao", e.target.value)} />
        </Campo>
        <CampoSelecao label="Sexo / gênero" span={3} valor={form.sexo} onChange={(v) => atualizar("sexo", v)} opcoes={OPCOES_SEXO} />
        <CampoSelecao label="Estado civil" span={3} valor={form.estadoCivil} onChange={(v) => atualizar("estadoCivil", v)} opcoes={OPCOES_ESTADO_CIVIL} />
      </Secao>

      <Secao numero={2} titulo="Documentação">
        <Campo label="CPF" span={2}>
          <input required value={form.cpf} onChange={(e) => atualizar("cpf", e.target.value)} />
        </Campo>
        <Campo label="RG" span={2}>
          <input value={form.rg} onChange={(e) => atualizar("rg", e.target.value)} />
        </Campo>
        <Campo label="Órgão emissor" span={2}>
          <input value={form.rgOrgaoEmissor} onChange={(e) => atualizar("rgOrgaoEmissor", e.target.value)} />
        </Campo>
        <Campo label="Cartão Nacional de Saúde (CNS/SUS)" span={3}>
          <input value={form.cns} onChange={(e) => atualizar("cns", e.target.value)} />
        </Campo>
        <Campo label="Convênio / plano de saúde" span={3}>
          <input value={form.convenio} onChange={(e) => atualizar("convenio", e.target.value)} />
        </Campo>
        <Campo label="Número da carteirinha" span={3}>
          <input value={form.numeroCarteirinha} onChange={(e) => atualizar("numeroCarteirinha", e.target.value)} />
        </Campo>
        <Campo label="Validade do plano" span={2}>
          <input type="date" value={form.validadeConvenio} onChange={(e) => atualizar("validadeConvenio", e.target.value)} />
        </Campo>
      </Secao>

      <Secao numero={3} titulo="Contatos">
        <Campo label="Celular / WhatsApp" span={2}>
          <input value={form.telefone} onChange={(e) => atualizar("telefone", e.target.value)} />
        </Campo>
        <Campo label="Telefone fixo" span={2}>
          <input value={form.telefoneFixo} onChange={(e) => atualizar("telefoneFixo", e.target.value)} />
        </Campo>
        <Campo label="E-mail" span={4}>
          <input type="email" value={form.email} onChange={(e) => atualizar("email", e.target.value)} />
        </Campo>
        <Campo label="Como conheceu a clínica / indicação" span={4}>
          <input value={form.comoConheceuClinica} onChange={(e) => atualizar("comoConheceuClinica", e.target.value)} />
        </Campo>
      </Secao>

      <Secao numero={4} titulo="Endereço residencial">
        <Campo label="CEP" span={2}>
          <input value={form.cep} onChange={(e) => atualizar("cep", e.target.value)} />
        </Campo>
        <Campo label="Logradouro (rua, av.)" span={5}>
          <input value={form.logradouro} onChange={(e) => atualizar("logradouro", e.target.value)} />
        </Campo>
        <Campo label="Número" span={1}>
          <input value={form.enderecoNumero} onChange={(e) => atualizar("enderecoNumero", e.target.value)} />
        </Campo>
        <Campo label="Complemento" span={2}>
          <input value={form.complemento} onChange={(e) => atualizar("complemento", e.target.value)} />
        </Campo>
        <Campo label="Bairro" span={2}>
          <input value={form.bairro} onChange={(e) => atualizar("bairro", e.target.value)} />
        </Campo>
        <Campo label="Município" span={3}>
          <input value={form.municipio} onChange={(e) => atualizar("municipio", e.target.value)} />
        </Campo>
        <Campo label="UF" span={1}>
          <input maxLength={2} value={form.uf} onChange={(e) => atualizar("uf", e.target.value.toUpperCase())} />
        </Campo>
        <Campo label="Ponto de referência" span={12}>
          <input value={form.pontoReferencia} onChange={(e) => atualizar("pontoReferencia", e.target.value)} />
        </Campo>
      </Secao>

      <Secao numero={5} titulo="Contato de emergência">
        <Campo label="Nome do contato" span={4}>
          <input value={form.emergenciaNome} onChange={(e) => atualizar("emergenciaNome", e.target.value)} />
        </Campo>
        <Campo label="Grau de parentesco" span={3}>
          <input value={form.emergenciaParentesco} onChange={(e) => atualizar("emergenciaParentesco", e.target.value)} />
        </Campo>
        <Campo label="Telefone de emergência" span={3}>
          <input value={form.emergenciaTelefone} onChange={(e) => atualizar("emergenciaTelefone", e.target.value)} />
        </Campo>
      </Secao>

      <Secao numero={6} titulo="Responsável" subtitulo="Preencher apenas se o paciente for menor de idade ou incapaz.">
        <Campo label="Nome do responsável" span={4}>
          <input value={form.responsavelNome} onChange={(e) => atualizar("responsavelNome", e.target.value)} />
        </Campo>
        <Campo label="CPF do responsável" span={2}>
          <input value={form.responsavelCpf} onChange={(e) => atualizar("responsavelCpf", e.target.value)} />
        </Campo>
        <Campo label="RG do responsável" span={2}>
          <input value={form.responsavelRg} onChange={(e) => atualizar("responsavelRg", e.target.value)} />
        </Campo>
        <Campo label="Grau de parentesco" span={2}>
          <input value={form.responsavelParentesco} onChange={(e) => atualizar("responsavelParentesco", e.target.value)} />
        </Campo>
        <Campo label="Telefone do responsável" span={2}>
          <input value={form.responsavelTelefone} onChange={(e) => atualizar("responsavelTelefone", e.target.value)} />
        </Campo>
      </Secao>

      <Secao numero={7} titulo="Informações de saúde / anamnese básica">
        <CampoSimNao label="Possui alergias?" span={3} valor={form.possuiAlergias} onChange={(v) => atualizar("possuiAlergias", v)} />
        {form.possuiAlergias && (
          <Campo label="Quais alergias?" span={4}>
            <input value={form.alergiasQuais} onChange={(e) => atualizar("alergiasQuais", e.target.value)} />
          </Campo>
        )}

        <CampoSimNao label="Toma medicação de uso contínuo?" span={3} valor={form.usaMedicacaoContinua} onChange={(v) => atualizar("usaMedicacaoContinua", v)} />
        {form.usaMedicacaoContinua && (
          <Campo label="Quais medicações?" span={4}>
            <input value={form.medicacaoQuais} onChange={(e) => atualizar("medicacaoQuais", e.target.value)} />
          </Campo>
        )}

        <CampoSelecao label="Tabagismo" span={3} valor={form.statusTabagismo} onChange={(v) => atualizar("statusTabagismo", v)} opcoes={OPCOES_TABAGISMO} />
        {form.statusTabagismo && form.statusTabagismo !== "NuncaFumou" && (
          <Campo label="Tempo / quantidade" span={3}>
            <input value={form.tabagismoDetalhe} onChange={(e) => atualizar("tabagismoDetalhe", e.target.value)} />
          </Campo>
        )}

        <CampoSimNao label="Possui doença crônica (hipertensão, diabetes etc.)?" span={4} valor={form.possuiDoencaCronica} onChange={(v) => atualizar("possuiDoencaCronica", v)} />
        {form.possuiDoencaCronica && (
          <Campo label="Quais doenças crônicas?" span={4}>
            <input value={form.doencaCronicaQuais} onChange={(e) => atualizar("doencaCronicaQuais", e.target.value)} />
          </Campo>
        )}

        <Campo label="Cirurgias prévias / internações" span={12}>
          <input value={form.cirurgiasInternacoes} onChange={(e) => atualizar("cirurgiasInternacoes", e.target.value)} />
        </Campo>
      </Secao>

      <Secao numero={8} titulo="Termo de consentimento (LGPD)">
        <label style={{ gridColumn: "span 12", display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "0.5rem" }}>
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
    </>
  );
}
