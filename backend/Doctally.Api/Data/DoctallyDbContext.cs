using Doctally.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Doctally.Api.Data;

// Resolve a clínica atual da requisição (definida pelo TenantResolutionMiddleware).
public interface ICurrentTenant
{
    Guid? ClinicaId { get; set; }
}

public class CurrentTenant : ICurrentTenant
{
    public Guid? ClinicaId { get; set; }
}

public class DoctallyDbContext : DbContext
{
    private readonly ICurrentTenant _currentTenant;

    public DoctallyDbContext(DbContextOptions<DoctallyDbContext> options, ICurrentTenant currentTenant)
        : base(options)
    {
        _currentTenant = currentTenant;
    }

    public DbSet<Clinica> Clinicas => Set<Clinica>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Atendimento> Atendimentos => Set<Atendimento>();
    public DbSet<LogAuditoria> LogsAuditoria => Set<LogAuditoria>();
    public DbSet<Modulo> Modulos => Set<Modulo>();
    public DbSet<ClinicaModulo> ClinicaModulos => Set<ClinicaModulo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Filtro global: toda query em entidades com ClinicaId só enxerga dados do tenant atual.
        // Isso é a principal barreira contra vazamento de dados entre clínicas — nunca remover.
        modelBuilder.Entity<Paciente>().HasQueryFilter(p => p.ClinicaId == _currentTenant.ClinicaId);
        modelBuilder.Entity<Atendimento>().HasQueryFilter(a => a.ClinicaId == _currentTenant.ClinicaId);
        modelBuilder.Entity<Usuario>().HasQueryFilter(u => u.ClinicaId == _currentTenant.ClinicaId);
        modelBuilder.Entity<ClinicaModulo>().HasQueryFilter(cm => cm.ClinicaId == _currentTenant.ClinicaId);

        modelBuilder.Entity<Paciente>().HasIndex(p => new { p.ClinicaId, p.Cpf }).IsUnique();
        modelBuilder.Entity<Usuario>().HasIndex(u => new { u.ClinicaId, u.Email }).IsUnique();

        modelBuilder.Entity<ClinicaModulo>().HasIndex(cm => new { cm.ClinicaId, cm.ModuloId }).IsUnique();
        modelBuilder.Entity<Modulo>().HasIndex(m => m.Chave).IsUnique();

        // Índices únicos parciais: CPF/CNPJ só precisam ser únicos quando preenchidos
        // (uma clínica pessoa física não tem CNPJ, e vice-versa).
        modelBuilder.Entity<Clinica>().HasIndex(c => c.Cnpj).IsUnique().HasFilter("\"Cnpj\" IS NOT NULL");
        modelBuilder.Entity<Clinica>().HasIndex(c => c.Cpf).IsUnique().HasFilter("\"Cpf\" IS NOT NULL");

        // Catálogo inicial de módulos vendáveis. StripePriceId fica nulo até o
        // POST /api/admin/modulos/sincronizar-stripe ser chamado. Preços em centavos (BRL) —
        // ajustáveis depois via PUT /api/admin/modulos/{id}.
        modelBuilder.Entity<Modulo>().HasData(
            new Modulo
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Chave = "prontuarios",
                Nome = "Prontuário Eletrônico",
                Descricao = "Prontuário e anamnese estruturada por atendimento.",
                PrecoMensalCentavos = 9900,
                Ativo = true,
            },
            new Modulo
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Chave = "receitas",
                Nome = "Receituário",
                Descricao = "Emissão de receituário simples e controlado.",
                PrecoMensalCentavos = 9900,
                Ativo = true,
            },
            new Modulo
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Chave = "faturamento",
                Nome = "Faturamento",
                Descricao = "Faturamento de consultas e convênios.",
                PrecoMensalCentavos = 14900,
                Ativo = true,
            }
        );
    }
}
