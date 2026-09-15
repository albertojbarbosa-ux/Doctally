namespace Doctally.Api.Models;

public enum OrigemAcesso
{
    Assinatura, // pago via Stripe
    Cortesia    // concedido manualmente, sem cobrança
}

public enum StatusAssinatura
{
    Ativa,
    Inadimplente,
    Cancelada,
    Trialing
}

// Relação clínica<->módulo: uma linha por (ClinicaId, ModuloId), mutada in-place ao longo
// do ciclo de vida (nunca duplicada). Representa tanto uma assinatura Stripe quanto uma
// concessão gratuita (cortesia) — nunca as duas ao mesmo tempo para o mesmo módulo.
public class ClinicaModulo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClinicaId { get; set; }
    public Clinica? Clinica { get; set; }
    public Guid ModuloId { get; set; }
    public Modulo? Modulo { get; set; }

    public OrigemAcesso Origem { get; set; }

    // Só relevante quando Origem == Assinatura.
    public StatusAssinatura? Status { get; set; }
    public string? StripeSubscriptionId { get; set; }

    // Só relevante quando Origem == Cortesia.
    public string? MotivoCortesia { get; set; }
    public Guid? ConcedidoPorUsuarioId { get; set; }

    public DateTime AtivoDesde { get; set; } = DateTime.UtcNow;
    // Setado apenas no cancelamento definitivo (assinatura cancelada / cortesia revogada).
    // Nulo = sem prazo definido. Inadimplência NÃO seta isso (ver StatusAssinatura.Inadimplente).
    public DateTime? AtivoAte { get; set; }
}
