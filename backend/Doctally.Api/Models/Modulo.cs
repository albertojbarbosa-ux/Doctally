namespace Doctally.Api.Models;

// Catálogo de módulos vendáveis. Não é filtrado por tenant — é compartilhado entre todas as clínicas.
public class Modulo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Chave { get; set; } = string.Empty; // ex: "prontuarios", "receitas", "faturamento"
    public string Nome { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public int PrecoMensalCentavos { get; set; }
    public string? StripePriceId { get; set; }
    public bool Ativo { get; set; } = true;
}
