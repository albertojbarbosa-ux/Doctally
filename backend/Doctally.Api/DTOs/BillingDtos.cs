namespace Doctally.Api.DTOs;

public record ModuloCatalogoResponse(
    Guid ModuloId,
    string Chave,
    string Nome,
    string Descricao,
    int PrecoMensalCentavos,
    string Status // "Disponivel" | "Contratado" | "Cortesia" | "PagamentoPendente"
);

public record CheckoutRequest(string ModuloChave);

public record CheckoutResponse(string UrlCheckout);

public record PortalResponse(string UrlPortal);
