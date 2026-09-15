using Doctally.Api.Data;

namespace Doctally.Api.Middleware;

// Lê a claim "clinica_id" do JWT autenticado e define o tenant da requisição.
// Enquanto não há login real (fase inicial de dev), aceita o header X-Clinica-Id.
public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ICurrentTenant currentTenant)
    {
        var claim = context.User?.FindFirst("clinica_id")?.Value;

        if (Guid.TryParse(claim, out var clinicaIdFromClaim))
        {
            currentTenant.ClinicaId = clinicaIdFromClaim;
        }
        else if (context.Request.Headers.TryGetValue("X-Clinica-Id", out var header)
                 && Guid.TryParse(header, out var clinicaIdFromHeader))
        {
            currentTenant.ClinicaId = clinicaIdFromHeader;
        }

        await _next(context);
    }
}
