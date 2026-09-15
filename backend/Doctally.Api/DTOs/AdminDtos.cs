namespace Doctally.Api.DTOs;

public record AdminClinicaResumoResponse(
    Guid ClinicaId,
    string Nome,
    string? Cnpj,
    string? Cpf,
    bool Ativa
);

public record AdminClinicaModuloResponse(
    Guid ModuloId,
    string Chave,
    string Nome,
    string Origem, // "Assinatura" | "Cortesia"
    string? Status,
    DateTime AtivoDesde,
    DateTime? AtivoAte,
    string? MotivoCortesia
);

public record ConcederCortesiaRequest(string ModuloChave, string Motivo);

public record AtualizarModuloRequest(string Nome, string Descricao, int PrecoMensalCentavos, bool Ativo);
