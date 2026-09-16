using Doctally.Api.Models;

namespace Doctally.Api.Services;

public record RespostaAnamneseExtraida(string PerguntaId, string Resposta);

public interface IAnamneseIaService
{
    Task<IReadOnlyList<RespostaAnamneseExtraida>> ExtrairRespostasAsync(
        string transcricao, IReadOnlyList<PerguntaAnamnese> perguntasPendentes);
}
