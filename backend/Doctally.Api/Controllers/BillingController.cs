using Doctally.Api.Data;
using Doctally.Api.DTOs;
using Doctally.Api.Models;
using Doctally.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace Doctally.Api.Controllers;

[ApiController]
[Route("api/billing")]
[Authorize]
public class BillingController : ControllerBase
{
    private readonly DoctallyDbContext _db;
    private readonly ICurrentTenant _tenant;
    private readonly IConfiguration _config;
    private readonly StripeOptions _stripeOptions;
    private readonly ILogger<BillingController> _logger;

    public BillingController(
        DoctallyDbContext db,
        ICurrentTenant tenant,
        IConfiguration config,
        IOptions<StripeOptions> stripeOptions,
        ILogger<BillingController> logger)
    {
        _db = db;
        _tenant = tenant;
        _config = config;
        _stripeOptions = stripeOptions.Value;
        _logger = logger;
    }

    [HttpGet("modulos")]
    public async Task<ActionResult<IEnumerable<ModuloCatalogoResponse>>> ListarModulos()
    {
        var modulos = await _db.Modulos.AsNoTracking().Where(m => m.Ativo).OrderBy(m => m.Nome).ToListAsync();
        // ClinicaModulos já é filtrado pelo tenant atual.
        var acessos = await _db.ClinicaModulos.AsNoTracking().ToListAsync();

        var resposta = modulos.Select(m =>
        {
            var acesso = acessos.FirstOrDefault(a => a.ModuloId == m.Id);
            var status = acesso switch
            {
                { Origem: OrigemAcesso.Cortesia, AtivoAte: null } => "Cortesia",
                { Origem: OrigemAcesso.Assinatura, Status: StatusAssinatura.Ativa } => "Contratado",
                { Origem: OrigemAcesso.Assinatura, Status: StatusAssinatura.Inadimplente } => "PagamentoPendente",
                _ => "Disponivel",
            };
            return new ModuloCatalogoResponse(m.Id, m.Chave, m.Nome, m.Descricao, m.PrecoMensalCentavos, status);
        });

        return Ok(resposta);
    }

    [HttpPost("checkout")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CheckoutResponse>> Checkout(CheckoutRequest request)
    {
        if (_tenant.ClinicaId is null) return BadRequest("Clínica não identificada na requisição.");

        var modulo = await _db.Modulos.FirstOrDefaultAsync(m => m.Chave == request.ModuloChave && m.Ativo);
        if (modulo is null) return NotFound("Módulo não encontrado.");

        var acessoExistente = await _db.ClinicaModulos.FirstOrDefaultAsync(cm => cm.ModuloId == modulo.Id);
        var jaTemAcesso = acessoExistente is { Origem: OrigemAcesso.Cortesia, AtivoAte: null }
            || acessoExistente is { Origem: OrigemAcesso.Assinatura, Status: StatusAssinatura.Ativa };
        if (jaTemAcesso)
            return Conflict("Sua clínica já tem acesso a este módulo.");

        if (string.IsNullOrWhiteSpace(modulo.StripePriceId))
            return Conflict("Este módulo ainda não está disponível para contratação (catálogo não sincronizado com o Stripe).");

        var clinica = await _db.Clinicas.FirstAsync(c => c.Id == _tenant.ClinicaId);

        if (string.IsNullOrWhiteSpace(clinica.StripeCustomerId))
        {
            var customerService = new CustomerService();
            var customer = await customerService.CreateAsync(new CustomerCreateOptions
            {
                Name = clinica.Nome,
                Metadata = new Dictionary<string, string> { ["clinicaId"] = clinica.Id.ToString() },
            });
            clinica.StripeCustomerId = customer.Id;
            await _db.SaveChangesAsync();
        }

        var frontendUrl = (_config["FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/');
        var metadata = new Dictionary<string, string>
        {
            ["clinicaId"] = clinica.Id.ToString(),
            ["moduloId"] = modulo.Id.ToString(),
            ["moduloChave"] = modulo.Chave,
        };

        var sessionService = new SessionService();
        var session = await sessionService.CreateAsync(new SessionCreateOptions
        {
            Mode = "subscription",
            Customer = clinica.StripeCustomerId,
            LineItems = new List<SessionLineItemOptions>
            {
                new() { Price = modulo.StripePriceId, Quantity = 1 }
            },
            SuccessUrl = $"{frontendUrl}/?checkout=sucesso",
            CancelUrl = $"{frontendUrl}/?checkout=cancelado",
            Metadata = metadata,
            SubscriptionData = new SessionSubscriptionDataOptions { Metadata = metadata },
        });

        return Ok(new CheckoutResponse(session.Url));
    }

    [HttpPost("portal")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PortalResponse>> Portal()
    {
        if (_tenant.ClinicaId is null) return BadRequest("Clínica não identificada na requisição.");

        var clinica = await _db.Clinicas.FirstAsync(c => c.Id == _tenant.ClinicaId);
        if (string.IsNullOrWhiteSpace(clinica.StripeCustomerId))
            return Conflict("Sua clínica ainda não tem nenhuma assinatura — contrate um módulo primeiro.");

        var frontendUrl = (_config["FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/');
        var portalService = new Stripe.BillingPortal.SessionService();
        var portalSession = await portalService.CreateAsync(new Stripe.BillingPortal.SessionCreateOptions
        {
            Customer = clinica.StripeCustomerId,
            ReturnUrl = $"{frontendUrl}/",
        });

        return Ok(new PortalResponse(portalSession.Url));
    }

    // Chamado diretamente pelo Stripe — sem JWT, sem tenant resolvido. Toda query aqui usa
    // IgnoreQueryFilters() e filtra manualmente pelos IDs vindos do metadata/payload do evento.
    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();
        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _stripeOptions.WebhookSecret);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao validar assinatura do webhook do Stripe.");
            return BadRequest();
        }

        switch (stripeEvent.Type)
        {
            case "checkout.session.completed":
            {
                var session = (Session)stripeEvent.Data.Object;
                await AtivarModuloPorMetadata(session.Metadata, session.SubscriptionId, StatusAssinatura.Ativa);
                break;
            }
            case "customer.subscription.updated":
            {
                var subscription = (Subscription)stripeEvent.Data.Object;
                var status = MapearStatus(subscription.Status);
                await AtualizarStatusAssinatura(subscription.Id, subscription.Metadata, status);
                break;
            }
            case "customer.subscription.deleted":
            {
                var subscription = (Subscription)stripeEvent.Data.Object;
                await CancelarAssinatura(subscription.Id, subscription.Metadata);
                break;
            }
            default:
                _logger.LogInformation("Evento do Stripe ignorado: {Tipo}", stripeEvent.Type);
                break;
        }

        return Ok();
    }

    private async Task AtivarModuloPorMetadata(IDictionary<string, string> metadata, string? stripeSubscriptionId, StatusAssinatura status)
    {
        if (!metadata.TryGetValue("clinicaId", out var clinicaIdStr) || !Guid.TryParse(clinicaIdStr, out var clinicaId)) return;
        if (!metadata.TryGetValue("moduloId", out var moduloIdStr) || !Guid.TryParse(moduloIdStr, out var moduloId)) return;

        var existente = await _db.ClinicaModulos.IgnoreQueryFilters()
            .FirstOrDefaultAsync(cm => cm.ClinicaId == clinicaId && cm.ModuloId == moduloId);

        if (existente is null)
        {
            _db.ClinicaModulos.Add(new ClinicaModulo
            {
                ClinicaId = clinicaId,
                ModuloId = moduloId,
                Origem = OrigemAcesso.Assinatura,
                Status = status,
                StripeSubscriptionId = stripeSubscriptionId,
                AtivoDesde = DateTime.UtcNow,
            });
        }
        else if (existente.Origem == OrigemAcesso.Assinatura)
        {
            existente.Status = status;
            existente.StripeSubscriptionId = stripeSubscriptionId;
            existente.AtivoAte = null;
        }
        // Se existente.Origem == Cortesia, nunca sobrescrever — a concessão manual prevalece.

        await _db.SaveChangesAsync();
    }

    private async Task AtualizarStatusAssinatura(string stripeSubscriptionId, IDictionary<string, string> metadata, StatusAssinatura status)
    {
        var existente = await _db.ClinicaModulos.IgnoreQueryFilters()
            .FirstOrDefaultAsync(cm => cm.StripeSubscriptionId == stripeSubscriptionId);

        if (existente is null)
        {
            // Primeira notícia dessa assinatura via este evento (ex: checkout.session.completed
            // ainda não processado) — usa o metadata do próprio evento pra criar o registro.
            await AtivarModuloPorMetadata(metadata, stripeSubscriptionId, status);
            return;
        }

        if (existente.Origem != OrigemAcesso.Assinatura) return; // nunca mexer em linha de cortesia
        existente.Status = status;
        await _db.SaveChangesAsync();
    }

    private async Task CancelarAssinatura(string stripeSubscriptionId, IDictionary<string, string> metadata)
    {
        var existente = await _db.ClinicaModulos.IgnoreQueryFilters()
            .FirstOrDefaultAsync(cm => cm.StripeSubscriptionId == stripeSubscriptionId);
        if (existente is null || existente.Origem != OrigemAcesso.Assinatura) return;

        existente.Status = StatusAssinatura.Cancelada;
        existente.AtivoAte = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    private static StatusAssinatura MapearStatus(string stripeStatus) => stripeStatus switch
    {
        "active" => StatusAssinatura.Ativa,
        "trialing" => StatusAssinatura.Trialing,
        "past_due" or "unpaid" or "incomplete" => StatusAssinatura.Inadimplente,
        "canceled" or "incomplete_expired" => StatusAssinatura.Cancelada,
        _ => StatusAssinatura.Inadimplente,
    };
}
