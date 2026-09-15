namespace Doctally.Api.DTOs;

public record CriarPacienteRequest(
    string NomeCompleto,
    string Cpf,
    DateOnly DataNascimento,
    string? Telefone,
    string? Email,
    string? Convenio,
    string? NumeroCarteirinha,
    bool ConsentimentoLgpd
);

public record PacienteResponse(
    Guid Id,
    string NomeCompleto,
    string Cpf,
    DateOnly DataNascimento,
    string? Telefone,
    string? Email,
    string? Convenio,
    bool ConsentimentoLgpd
);
