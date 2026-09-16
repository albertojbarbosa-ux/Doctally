import { useCallback, useEffect, useRef, useState } from "react";
import {
  atualizarAtendimento,
  criarAtendimento,
  listarPerguntasAnamnese,
  processarAnamneseIa,
} from "../api/atendimentos";

const INTERVALO_MIN_PROCESSAMENTO_MS = 6000;
const TRANSCRICAO_MAX_CHARS = 8000;

function agruparPorSecao(perguntas) {
  const grupos = [];
  for (const p of perguntas) {
    let grupo = grupos.find((g) => g.secao === p.secao);
    if (!grupo) {
      grupo = { secao: p.secao, perguntas: [] };
      grupos.push(grupo);
    }
    grupo.perguntas.push(p);
  }
  return grupos;
}

export default function AssistenteAnamnese({ pacienteId }) {
  const [perguntas, setPerguntas] = useState([]);
  const [carregandoPerguntas, setCarregandoPerguntas] = useState(true);
  const [respostas, setRespostas] = useState({});
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
      .catch((e) => setErro(e.message))
      .finally(() => setCarregandoPerguntas(false));
  }, []);

  const pararEscuta = useCallback(() => {
    deveContinuarRef.current = false;
    recognitionRef.current?.stop();
    setOuvindo(false);
  }, []);

  useEffect(() => () => pararEscuta(), [pararEscuta]);

  const processarTrecho = useCallback(async () => {
    const pendentesIds = perguntasRef.current
      .map((p) => p.id)
      .filter((id) => !respostasRef.current[id]);
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

  const editarResposta = (id, texto) => {
    setSalvo(false);
    setRespostas((atual) => ({ ...atual, [id]: texto }));
  };

  const salvarAnamnese = async () => {
    if (!atendimentoIdRef.current) {
      setErro("Inicie a consulta (ou responda ao menos uma pergunta) antes de salvar.");
      return;
    }

    setErro(null);
    setSalvando(true);

    const composto = (campo) => {
      const texto = perguntas
        .filter((p) => p.campoAlvo === campo && respostas[p.id])
        .map((p) => respostas[p.id])
        .join(" ");
      return texto || null;
    };

    try {
      await atualizarAtendimento(atendimentoIdRef.current, {
        queixaPrincipal: composto("QueixaPrincipal"),
        historiaDoencaAtual: composto("HistoriaDoencaAtual"),
        antecedentesPessoais: composto("AntecedentesPessoais"),
        antecedentesFamiliares: composto("AntecedentesFamiliares"),
        revisadoPeloMedico: revisado,
      });
      setSalvo(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const grupos = agruparPorSecao(perguntas);
  const totalRespondidas = Object.keys(respostas).filter((id) => respostas[id]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
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
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginLeft: "auto" }}>
            {totalRespondidas} de {perguntas.length} perguntas respondidas
          </span>
        </div>

        {ouvindo && transcricaoParcial && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
            "{transcricaoParcial}"
          </p>
        )}

        {erro && <p style={{ color: "var(--danger)", fontSize: "0.85rem", margin: 0 }}>{erro}</p>}

        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
          A IA escuta a consulta pelo microfone, mostra as perguntas do roteiro padrão de anamnese para o
          médico fazer ao paciente e vai preenchendo as respostas conforme identifica que cada pergunta foi
          feita e respondida. Revise o texto antes de salvar.
        </p>
      </div>

      {carregandoPerguntas && <p style={{ color: "var(--text-muted)" }}>Carregando roteiro de anamnese...</p>}

      {!carregandoPerguntas &&
        grupos.map((grupo) => (
          <div key={grupo.secao} style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <h3 style={{ fontSize: "0.95rem", color: "var(--primary-dark)" }}>{grupo.secao}</h3>
            {grupo.perguntas.map((pergunta) => {
              const respondida = Boolean(respostas[pergunta.id]);
              return (
                <div
                  key={pergunta.id}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "0.75rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
                    <span style={{ color: respondida ? "var(--primary-dark)" : "var(--text-muted)" }}>
                      {respondida ? "✓" : "○"}
                    </span>
                    <span style={{ fontSize: "0.88rem" }}>{pergunta.texto}</span>
                  </div>
                  <textarea
                    rows={respondida ? 2 : 1}
                    placeholder="Resposta ainda não identificada — pergunte ao paciente."
                    value={respostas[pergunta.id] ?? ""}
                    onChange={(e) => editarResposta(pergunta.id, e.target.value)}
                    style={{
                      width: "100%",
                      resize: "vertical",
                      fontSize: "0.85rem",
                      fontFamily: "inherit",
                      padding: "0.5rem 0.6rem",
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: respondida ? "var(--bg)" : "transparent",
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}

      {!carregandoPerguntas && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            borderTop: "1px solid var(--border)",
            paddingTop: "1rem",
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
      )}
    </div>
  );
}
