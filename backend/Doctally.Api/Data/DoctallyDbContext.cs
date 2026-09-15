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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Filtro global: toda query em entidades com ClinicaId só enxerga dados do tenant atual.
        // Isso é a principal barreira contra vazamento de dados entre clínicas — nunca remover.
        modelBuilder.Entity<Paciente>().HasQueryFilter(p => p.ClinicaId == _currentTenant.ClinicaId);
        modelBuilder.Entity<Atendimento>().HasQueryFilter(a => a.ClinicaId == _currentTenant.ClinicaId);
        modelBuilder.Entity<Usuario>().HasQueryFilter(u => u.ClinicaId == _currentTenant.ClinicaId);

        modelBuilder.Entity<Paciente>().HasIndex(p => new { p.ClinicaId, p.Cpf }).IsUnique();
        modelBuilder.Entity<Usuario>().HasIndex(u => new { u.ClinicaId, u.Email }).IsUnique();
    }
}
