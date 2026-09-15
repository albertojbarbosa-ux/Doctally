namespace Doctally.Api.DTOs;

public record RegistrarClinicaRequest(
    string NomeClinica,
    string TipoPessoa, // "Fisica" ou "Juridica"
    string? Cnpj,
    string? Cpf,
    string NomeAdmin,
    string EmailAdmin,
    string Senha
);

public record LoginRequest(string Email, string Senha);

public record LoginResponse(string Token, string Nome, string Papel, Guid ClinicaId, bool EhSuperAdmin);

public record EsqueciSenhaRequest(string Email);

public record GoogleLoginRequest(string IdToken);

public record RedefinirSenhaRequest(string Token, string NovaSenha);
