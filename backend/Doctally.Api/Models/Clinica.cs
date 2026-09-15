namespace Doctally.Api.Models;

public enum TipoPessoa
{
    // Juridica primeiro (valor 0): é o padrão para todas as clínicas cadastradas até aqui
    // (só tinham CNPJ), então uma migration que adiciona esta coluna com defaultValue 0
    // classifica corretamente os registros existentes.
    Juridica,
    Fisica
}

// Representa uma clínica/tenant no sistema multi-tenant.
public class Clinica
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;

    public TipoPessoa TipoPessoa { get; set; } = TipoPessoa.Juridica;
    // Exatamente um dos dois é preenchido, de acordo com TipoPessoa.
    public string? Cnpj { get; set; }
    public string? Cpf { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public bool Ativa { get; set; } = true;

    // Customer no Stripe (um por clínica, reaproveitado em toda assinatura de módulo).
    public string? StripeCustomerId { get; set; }

    public ICollection<Paciente> Pacientes { get; set; } = new List<Paciente>();
    public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    public ICollection<ClinicaModulo> Modulos { get; set; } = new List<ClinicaModulo>();
}
