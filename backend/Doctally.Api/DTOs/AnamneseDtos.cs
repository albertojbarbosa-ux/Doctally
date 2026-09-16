namespace Doctally.Api.DTOs;

public record PerguntaAnamneseResponse(string Id, string Secao, string CampoAlvo, string Texto);

public record AtendimentoResponse(
    Guid Id,
    Guid PacienteId,
    Guid MedicoId,
    DateTime DataHora,
    string? QueixaPrincipal,
    string? HistoriaDoencaAtual,
    string? AntecedentesPessoais,
    string? AntecedentesFamiliares,
    string Origem,
    bool RevisadoPeloMedico,
    DateTime? FinalizadoEm
);

public record AtualizarAtendimentoRequest(
    string? QueixaPrincipal,
    string? HistoriaDoencaAtual,
    string? AntecedentesPessoais,
    string? AntecedentesFamiliares,
    bool RevisadoPeloMedico
);

public record ProcessarAnamneseIaRequest(string Transcricao, string[] PerguntasPendentesIds);

public record RespostaAnamneseIaResponse(string PerguntaId, string Resposta);
