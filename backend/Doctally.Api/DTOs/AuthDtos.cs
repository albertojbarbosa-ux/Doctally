namespace Doctally.Api.DTOs;

public record RegistrarClinicaRequest(
    string NomeClinica,
    string Cnpj,
    string NomeAdmin,
    string EmailAdmin,
    string Senha
);

public record LoginRequest(string Email, string Senha);

public record LoginResponse(string Token, string Nome, string Papel, Guid ClinicaId);

public record EsqueciSenhaRequest(string Email);

public record RedefinirSenhaRequest(string Token, string NovaSenha);
