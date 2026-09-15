using Doctally.Api.Data;
using Doctally.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Doctally.Api.Services;

public class ModuleAccessService : IModuleAccessService
{
    private readonly DoctallyDbContext _db;

    public ModuleAccessService(DoctallyDbContext db)
    {
        _db = db;
    }

    public async Task<bool> ClinicaTemAcessoAsync(string moduloChave)
    {
        // ClinicaModulo já é filtrado por tenant (HasQueryFilter), então isso só considera
        // linhas da clínica atual.
        var acesso = await _db.ClinicaModulos
            .AsNoTracking()
            .Where(cm => cm.Modulo!.Chave == moduloChave)
            .Select(cm => new { cm.Origem, cm.Status, cm.AtivoAte })
            .FirstOrDefaultAsync();

        if (acesso is null) return false;

        return (acesso.Origem == OrigemAcesso.Cortesia && acesso.AtivoAte is null)
            || (acesso.Origem == OrigemAcesso.Assinatura && acesso.Status == StatusAssinatura.Ativa);
    }
}
