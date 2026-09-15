using Doctally.Api.Data;
using Doctally.Api.DTOs;
using Doctally.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace Doctally.Api.Controllers;

// Endpoints de equipe Doctally (não de clínica) — gerenciam módulos e concessões de cortesia
// entre todas as clínicas. Toda query aqui usa IgnoreQueryFilters() propositalmente.
[ApiController]
[Route("api/admin")]
[Authorize(Policy = "SuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly DoctallyDbContext _db;

    public AdminController(DoctallyDbContext db)
    {
        _db = db;
    }

    [HttpGet("clinicas")]
    public async Task<ActionResult<IEnumerable<AdminClinicaResumoResponse>>> ListarClinicas([FromQuery] string? busca)
    {
        var query = _db.Clinicas.IgnoreQueryFilters().AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(busca))
        {
            query = query.Where(c => c.Nome.Contains(busca) || (c.Cnpj != null && c.Cnpj.Contains(busca)) || (c.Cpf != null && c.Cpf.Contains(busca)));
        }

        var clinicas = await query
            .OrderBy(c => c.Nome)
            .Select(c => new AdminClinicaResumoResponse(c.Id, c.Nome, c.Cnpj, c.Cpf, c.Ativa))
            .ToListAsync();

        return Ok(clinicas);
    }

    [HttpGet("clinicas/{clinicaId:guid}/modulos")]
    public async Task<ActionResult<IEnumerable<AdminClinicaModuloResponse>>> ModulosDaClinica(Guid clinicaId)
    {
        var modulos = await _db.ClinicaModulos.IgnoreQueryFilters().AsNoTracking()
            .Where(cm => cm.ClinicaId == clinicaId)
            .Include(cm => cm.Modulo)
            .Select(cm => new AdminClinicaModuloResponse(
                cm.ModuloId, cm.Modulo!.Chave, cm.Modulo.Nome, cm.Origem.ToString(),
                cm.Status.ToString(), cm.AtivoDesde, cm.AtivoAte, cm.MotivoCortesia))
            .ToListAsync();

        return Ok(modulos);
    }

    [HttpPost("clinicas/{clinicaId:guid}/cortesia")]
    public async Task<IActionResult> ConcederCortesia(Guid clinicaId, ConcederCortesiaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Motivo))
            return BadRequest("Informe o motivo da concessão de cortesia.");

        var clinica = await _db.Clinicas.IgnoreQueryFilters().AnyAsync(c => c.Id == clinicaId);
        if (!clinica) return NotFound("Clínica não encontrada.");

        var modulo = await _db.Modulos.FirstOrDefaultAsync(m => m.Chave == request.ModuloChave);
        if (modulo is null) return NotFound("Módulo não encontrado.");

        var existente = await _db.ClinicaModulos.IgnoreQueryFilters()
            .FirstOrDefaultAsync(cm => cm.ClinicaId == clinicaId && cm.ModuloId == modulo.Id);

        if (existente is { Origem: OrigemAcesso.Assinatura, Status: StatusAssinatura.Ativa })
            return Conflict("Esta clínica já tem uma assinatura paga ativa para este módulo — revogue-a antes de conceder cortesia.");

        var usuarioIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        Guid.TryParse(usuarioIdClaim, out var concedidoPor);

        if (existente is null)
        {
            _db.ClinicaModulos.Add(new ClinicaModulo
            {
                ClinicaId = clinicaId,
                ModuloId = modulo.Id,
                Origem = OrigemAcesso.Cortesia,
                MotivoCortesia = request.Motivo,
                ConcedidoPorUsuarioId = concedidoPor,
                AtivoDesde = DateTime.UtcNow,
            });
        }
        else
        {
            // Idempotente: já é cortesia (ou uma assinatura cancelada/inadimplente) — atualiza.
            existente.Origem = OrigemAcesso.Cortesia;
            existente.MotivoCortesia = request.Motivo;
            existente.ConcedidoPorUsuarioId = concedidoPor;
            existente.AtivoAte = null;
            existente.Status = null;
            existente.StripeSubscriptionId = null;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("clinicas/{clinicaId:guid}/cortesia/{moduloId:guid}")]
    public async Task<IActionResult> RevogarCortesia(Guid clinicaId, Guid moduloId)
    {
        var existente = await _db.ClinicaModulos.IgnoreQueryFilters()
            .FirstOrDefaultAsync(cm => cm.ClinicaId == clinicaId && cm.ModuloId == moduloId);

        if (existente is null || existente.Origem != OrigemAcesso.Cortesia)
            return NotFound("Não há concessão de cortesia ativa para revogar.");

        existente.AtivoAte = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // Cria Product+Price no Stripe para módulos do catálogo que ainda não têm StripePriceId.
    // Idempotente: pula módulos que já estão sincronizados.
    [HttpPost("modulos/sincronizar-stripe")]
    public async Task<IActionResult> SincronizarComStripe()
    {
        var pendentes = await _db.Modulos.Where(m => m.StripePriceId == null).ToListAsync();
        var resultados = new List<object>();

        foreach (var modulo in pendentes)
        {
            try
            {
                var productService = new ProductService();
                var product = await productService.CreateAsync(new ProductCreateOptions
                {
                    Name = modulo.Nome,
                    Description = modulo.Descricao,
                });

                var priceService = new PriceService();
                var price = await priceService.CreateAsync(new PriceCreateOptions
                {
                    Product = product.Id,
                    Currency = "brl",
                    UnitAmount = modulo.PrecoMensalCentavos,
                    Recurring = new PriceRecurringOptions { Interval = "month" },
                });

                modulo.StripePriceId = price.Id;
                resultados.Add(new { modulo.Chave, sucesso = true, stripePriceId = price.Id });
            }
            catch (StripeException ex)
            {
                resultados.Add(new { modulo.Chave, sucesso = false, erro = ex.Message });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(resultados);
    }

    [HttpPut("modulos/{id:guid}")]
    public async Task<IActionResult> AtualizarModulo(Guid id, AtualizarModuloRequest request)
    {
        var modulo = await _db.Modulos.FirstOrDefaultAsync(m => m.Id == id);
        if (modulo is null) return NotFound();

        var precoMudou = modulo.PrecoMensalCentavos != request.PrecoMensalCentavos;

        modulo.Nome = request.Nome;
        modulo.Descricao = request.Descricao;
        modulo.PrecoMensalCentavos = request.PrecoMensalCentavos;
        modulo.Ativo = request.Ativo;

        if (precoMudou && !string.IsNullOrWhiteSpace(modulo.StripePriceId))
        {
            // Price é imutável no Stripe: arquiva o antigo e cria um novo. Assinaturas já
            // existentes continuam no preço antigo até o próximo ciclo/mudança manual.
            var priceService = new PriceService();
            var priceAntigo = await priceService.GetAsync(modulo.StripePriceId);

            await priceService.UpdateAsync(modulo.StripePriceId, new PriceUpdateOptions { Active = false });

            var novoPreco = await priceService.CreateAsync(new PriceCreateOptions
            {
                Product = priceAntigo.ProductId,
                Currency = "brl",
                UnitAmount = request.PrecoMensalCentavos,
                Recurring = new PriceRecurringOptions { Interval = "month" },
            });
            modulo.StripePriceId = novoPreco.Id;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }
}
