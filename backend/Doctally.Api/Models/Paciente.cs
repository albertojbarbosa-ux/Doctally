namespace Doctally.Api.Models;

public class Paciente
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClinicaId { get; set; }
    public Clinica? Clinica { get; set; }

    public string NomeCompleto { get; set; } = string.Empty;
    public string Cpf { get; set; } = string.Empty; // criptografar em repouso na camada de persistência
    public DateOnly DataNascimento { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Convenio { get; set; }
    public string? NumeroCarteirinha { get; set; }

    // LGPD: registro do consentimento de tratamento de dados de saúde.
    public bool ConsentimentoLgpd { get; set; }
    public DateTime? ConsentimentoLgpdEm { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
}
