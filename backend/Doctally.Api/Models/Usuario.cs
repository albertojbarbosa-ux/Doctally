namespace Doctally.Api.Models;

public enum PapelUsuario
{
    Admin,
    Medico,
    Recepcao
}

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClinicaId { get; set; }
    public Clinica? Clinica { get; set; }

    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public PapelUsuario Papel { get; set; }

    // Preenchido apenas para usuários com papel Medico (necessário para receituário).
    public string? Crm { get; set; }
    public string? UfCrm { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public bool Ativo { get; set; } = true;
}
