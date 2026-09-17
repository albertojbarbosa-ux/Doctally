import { useCallback, useEffect, useRef, useState } from "react";
import { obterPaciente } from "../api/pacientes";
import {
  atualizarAtendimento,
  criarAtendimento,
  listarPerguntasAnamnese,
  obterUltimoAtendimento,
  processarAnamneseIa,
} from "../api/atendimentos";

const INTERVALO_MIN_PROCESSAMENTO_MS = 6000;
const TRANSCRICAO_MAX_CHARS = 8000;

const CAMPOS = [
  { chave: "QueixaPrincipal", titulo: "Queixa Principal" },
  { chave: "HistoriaDoencaAtual", titulo: "História da Doença Atual" },
  { chave: "AntecedentesPessoais", titulo: "Antecedentes Pessoais e Hábitos" },
  { chave: "AntecedentesFamiliares", titulo: "Antecedentes Familiares" },
];

const painelStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "1.1rem 1.25rem",
  overflowY: "auto",
  flex: 1,
  minHeight: 0,
};

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  return aindaNaoFezAniversario ? idade - 1 : idade;
}

function Campo({ titulo, valor }) {
  if (!valor) return null;
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div
        style={{
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {titulo}
      </div>
      <div style={{ fontSize: "0.88rem" }}>{valor}</div>
    </div>
  );
}

function PainelDadosPaciente({ pacienteId }) {
  const [paciente, setPaciente] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    obterPaciente(pacienteId)
      .then(setPaciente)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [pacienteId]);

  return (
    <div style={painelStyle}>
      <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>Dados do paciente</h3>
      {carregando && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Carregando...</p>}
      {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{erro}</p>}
      {paciente && (
        <>
          <div style={{ fontSize: "1.05rem", fontFamily: "var(--font-display)", marginBottom: "0.6rem" }}>
            {paciente.nomeCompleto}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem 1.5rem" }}>
            <Campo titulo="Idade" valor={`${calcularIdade(paciente.dataNascimento)} anos`} />
            <Campo titulo="Sexo" valor={paciente.sexo} />
            <Campo titulo="Telefone" valor={paciente.telefone} />
            <Campo titulo="Convênio" valor={paciente.convenio || "Particular"} />
          </div>
          <Campo
            titulo="Alergias"
            valor={paciente.possuiAlergias ? paciente.alergiasQuais || "Sim, sem detalhamento" : "Nenhuma registrada"}
          />
          <Campo
            titulo="Medicação em uso"
            valor={paciente.usaMedicacaoContinua ? paciente.medicacaoQuais || "Sim, sem detalhamento" : null}
          />
        </>
      )}
    </div>
  );
}

function PainelUltimaConsulta({ pacienteId }) {
  const [atendimento, setAtendimento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    obterUltimoAtendimento(pacienteId)
      .then(setAtendimento)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [pacienteId]);

  return (
    <div style={painelStyle}>
      <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>Pontos principais da última consulta</h3>
      {carregando && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Carregando...</p>}
      {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{erro}</p>}
      {!carregando && !erro && !atendimento && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Nenhuma consulta anterior registrada.</p>
      )}
      {atendimento && (
        <>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.6rem" }}>
            {new Date(atendimento.dataHora).toLocaleDateString("pt-BR")}
          </p>
          <Campo titulo="Queixa Principal" valor={atendimento.queixaPrincipal} />
          <Campo titulo="História da Doença Atual" valor={atendimento.historiaDoencaAtual} />
          <Campo titulo="Antecedentes Pessoais" valor={atendimento.antecedentesPessoais} />
          <Campo titulo="Antecedentes Familiares" valor={atendimento.antecedentesFamiliares} />
        </>
      )}
    </div>
  );
}

export default function AssistenteAnamnese({ pacienteId }) {
  const [perguntas, setPerguntas] = useState([]);
  const [respostas, setRespostas] = useState({});
  const [camposEditados, setCamposEditados] = useState({});
  const [ouvindo, setOuvindo] = useState(false);
  const [transcricaoParcial, setTranscricaoParcial] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [revisado, setRevisado] = useState(false);

  const atendimentoIdRef = useRef(null);
  const recognitionRef = useRef(null);
  const deveContinuarRef = useRef(false);
  const transcricaoRef = useRef("");
  const ultimoProcessamentoRef = useRef(0);
  const respostasRef = useRef({});
  const perguntasRef = useRef([]);

  const suportado =
    typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    respostasRef.current = respostas;
  }, [respostas]);

  useEffect(() => {
    perguntasRef.current = perguntas;
  }, [perguntas]);

  useEffect(() => {
    listarPerguntasAnamnese()
      .then(setPerguntas)
      .catch((e) => setErro(e.message));
  }, []);

  const pararEscuta = useCallback(() => {
    deveContinuarRef.current = false;
    recognitionRef.current?.stop();
    setOuvindo(false);
  }, []);

  useEffect(() => () => pararEscuta(), [pararEscuta]);

  const processarTrecho = useCallback(async () => {
    const pendentesIds = perguntasRef.current.map((p) => p.id).filter((id) => !respostasRef.current[id]);
    if (pendentesIds.length === 0 || !atendimentoIdRef.current) return;

    setProcessando(true);
    try {
      const extraidas = await processarAnamneseIa(
        atendimentoIdRef.current,
        transcricaoRef.current.slice(-TRANSCRICAO_MAX_CHARS),
        pendentesIds
      );
      if (extraidas.length > 0) {
        setRespostas((atual) => {
          const novo = { ...atual };
          for (const r of extraidas) novo[r.perguntaId] = r.resposta;
          return novo;
        });
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(false);
    }
  }, []);

  const agendarProcessamento = useCallback(() => {
    const agora = Date.now();
    if (agora - ultimoProcessamentoRef.current < INTERVALO_MIN_PROCESSAMENTO_MS) return;
    ultimoProcessamentoRef.current = agora;
    processarTrecho();
  }, [processarTrecho]);

  const iniciarEscuta = async () => {
    setErro(null);

    if (!suportado) {
      setErro("Reconhecimento de voz não é suportado neste navegador. Use o Google Chrome.");
      return;
    }

    if (!atendimentoIdRef.current) {
      try {
        const atendimento = await criarAtendimento(pacienteId);
        atendimentoIdRef.current = atendimento.id;
      } catch (e) {
        setErro(e.message);
        return;
      }
    }

    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionApi();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (evento) => {
      let parcial = "";
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const resultado = evento.results[i];
        if (resultado.isFinal) {
          transcricaoRef.current += " " + resultado[0].transcript;
        } else {
          parcial += resultado[0].transcript;
        }
      }
      setTranscricaoParcial(parcial);
      if (transcricaoRef.current.trim().length > 0) agendarProcessamento();
    };

    recognition.onerror = (evento) => {
      if (evento.error === "no-speech" || evento.error === "aborted") return;
      if (evento.error === "not-allowed") {
        setErro("Permissão de microfone negada. Habilite o microfone para este site e tente novamente.");
        deveContinuarRef.current = false;
        setOuvindo(false);
        return;
      }
      setErro(`Erro no reconhecimento de voz: ${evento.error}`);
    };

    recognition.onend = () => {
      if (deveContinuarRef.current) {
        try {
          recognition.start();
        } catch {
          // já em execução — ignora
        }
      }
    };

    deveContinuarRef.current = true;
    recognitionRef.current = recognition;
    recognition.start();
    setOuvindo(true);
  };

  const composto = (campo) => {
    const texto = perguntas
      .filter((p) => p.campoAlvo === campo && respostas[p.id])
      .map((p) => respostas[p.id])
      .join(" ");
    return texto || "";
  };

  const valorCampo = (campo) => camposEditados[campo] ?? composto(campo);

  const editarCampo = (campo, texto) => {
    setSalvo(false);
    setCamposEditados((atual) => ({ ...atual, [campo]: texto }));
  };

  const salvarAnamnese = async () => {
    if (!atendimentoIdRef.current) {
      setErro("Inicie a consulta com a IA antes de salvar.");
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      await atualizarAtendimento(atendimentoIdRef.current, {
        queixaPrincipal: valorCampo("QueixaPrincipal") || null,
        historiaDoencaAtual: valorCampo("HistoriaDoencaAtual") || null,
        antecedentesPessoais: valorCampo("AntecedentesPessoais") || null,
        antecedentesFamiliares: valorCampo("AntecedentesFamiliares") || null,
        revisadoPeloMedico: revisado,
      });
      setSalvo(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.25rem", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", minHeight: 0 }}>
        <PainelDadosPaciente pacienteId={pacienteId} />
        <PainelUltimaConsulta pacienteId={pacienteId} />
      </div>

      <div style={{ ...painelStyle, display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="button" onClick={ouvindo ? pararEscuta : iniciarEscuta}>
            {ouvindo ? "■ Parar consulta com IA" : "🎙 Iniciar consulta com IA"}
          </button>
          {ouvindo && (
            <span style={{ fontSize: "0.85rem", color: "var(--primary-dark)", fontWeight: 600 }}>
              ● Ouvindo o consultório...
            </span>
          )}
          {processando && (
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Analisando o que foi dito...</span>
          )}
        </div>

        {ouvindo && transcricaoParcial && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
            "{transcricaoParcial}"
          </p>
        )}

        {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}

        <div
          style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.9rem" }}
        >
          {CAMPOS.map((campo) => (
            <div key={campo.chave}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{campo.titulo}</label>
              <textarea
                rows={3}
                placeholder="A IA preenche aqui conforme a consulta avança — ou digite diretamente."
                value={valorCampo(campo.chave)}
                onChange={(e) => editarCampo(campo.chave, e.target.value)}
                style={{
                  width: "100%",
                  resize: "vertical",
                  fontSize: "0.88rem",
                  fontFamily: "inherit",
                  padding: "0.55rem 0.7rem",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  marginTop: "0.3rem",
                }}
              />
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "0.85rem",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
            <input type="checkbox" checked={revisado} onChange={(e) => setRevisado(e.target.checked)} />
            Revisei as respostas acima com o paciente
          </label>
          <button type="button" onClick={salvarAnamnese} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar anamnese"}
          </button>
          {salvo && <span style={{ color: "var(--primary-dark)", fontSize: "0.85rem" }}>Anamnese salva.</span>}
        </div>
      </div>
    </div>
  );
}
