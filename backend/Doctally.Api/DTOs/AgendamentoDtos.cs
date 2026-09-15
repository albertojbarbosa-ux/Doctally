namespace Doctally.Api.DTOs;

public record CriarAgendamentoRequest(Guid PacienteId, DateOnly Data, TimeOnly Horario, int DuracaoMinutos);

public record AtualizarAgendamentoRequest(DateOnly Data, TimeOnly Horario);

public record AgendamentoResponse(
    Guid Id,
    Guid PacienteId,
    string PacienteNome,
    string? PacienteTelefone,
    DateOnly Data,
    TimeOnly Horario,
    int DuracaoMinutos
);
