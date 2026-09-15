namespace Doctally.Api.Models;

// Representa uma clínica/tenant no sistema multi-tenant.
public class Clinica
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public bool Ativa { get; set; } = true;

    public ICollection<Paciente> Pacientes { get; set; } = new List<Paciente>();
    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
}
