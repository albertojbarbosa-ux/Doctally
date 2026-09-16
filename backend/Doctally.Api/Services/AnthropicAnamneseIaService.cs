using System.Text.Json;
using Anthropic;
using Anthropic.Models.Messages;
using Doctally.Api.Models;

namespace Doctally.Api.Services;

// Lê a transcrição da consulta (feita no navegador do médico via reconhecimento de voz)
// e identifica quais perguntas do roteiro padrão de anamnese já foram feitas e
// respondidas, devolvendo um resumo clínico da resposta do paciente para cada uma.
// O médico sempre revisa/edita antes de salvar (ver AtendimentosController).
public class AnthropicAnamneseIaService : IAnamneseIaService
{
    private const string Modelo = "claude-opus-5";

    private static readonly JsonSerializerOptions JsonOpcoes = new(JsonSerializerDefaults.Web);

    private const string SystemPrompt = """
        Você ajuda um médico a preencher a anamnese durante uma consulta em tempo real.
        Você recebe uma transcrição automática (feita por reconhecimento de voz, pode
        conter erros) da conversa entre médico e paciente em português, e uma lista de
        perguntas padrão de anamnese que ainda não foram respondidas.

        Tarefa: identifique, na transcrição, quais dessas perguntas o médico já fez ao
        paciente E cuja resposta o paciente já deu. Para cada uma, escreva um resumo
        clínico conciso, objetivo e em terceira pessoa (registro de prontuário médico,
        por exemplo "Nega alergias medicamentosas." ou "Refere dor em queimação, sem
        irradiação.") da resposta do paciente, em português.

        Não invente respostas: inclua apenas perguntas cuja resposta esteja de fato
        presente na transcrição. Se nenhuma pergunta nova foi respondida, retorne uma
        lista vazia em "respostas".
        """;

    private readonly AnthropicClient _client;

    public AnthropicAnamneseIaService(AnthropicClient client)
    {
        _client = client;
    }

    public async Task<IReadOnlyList<RespostaAnamneseExtraida>> ExtrairRespostasAsync(
        string transcricao, IReadOnlyList<PerguntaAnamnese> perguntasPendentes)
    {
        if (perguntasPendentes.Count == 0 || string.IsNullOrWhiteSpace(transcricao))
            return Array.Empty<RespostaAnamneseExtraida>();

        var perguntasJson = JsonSerializer.Serialize(
            perguntasPendentes.Select(p => new { id = p.Id, texto = p.Texto }));

        var schema = new Dictionary<string, JsonElement>
        {
            ["type"] = JsonSerializer.SerializeToElement("object"),
            ["properties"] = JsonSerializer.SerializeToElement(new
            {
                respostas = new
                {
                    type = "array",
                    items = new
                    {
                        type = "object",
                        properties = new
                        {
                            perguntaId = new { type = "string" },
                            resposta = new { type = "string" },
                        },
                        required = new[] { "perguntaId", "resposta" },
                    },
                },
            }),
            ["required"] = JsonSerializer.SerializeToElement(new[] { "respostas" }),
        };

        var response = await _client.Messages.Create(new MessageCreateParams
        {
            Model = Modelo,
            MaxTokens = 2048,
            OutputConfig = new OutputConfig
            {
                Effort = Effort.Low,
                Format = new JsonOutputFormat { Schema = schema },
            },
            System = SystemPrompt,
            Messages =
            [
                new()
                {
                    Role = Role.User,
                    Content = $$"""
                        Transcrição da consulta até agora (pode conter erros de reconhecimento de voz):
                        ---
                        {{transcricao}}
                        ---

                        Perguntas padrão de anamnese ainda não respondidas (JSON, cada uma com "id" e "texto"):
                        {{perguntasJson}}
                        """,
                },
            ],
        });

        var textoResposta = response.Content
            .Select(b => b.Value)
            .OfType<TextBlock>()
            .FirstOrDefault()?.Text;

        if (string.IsNullOrWhiteSpace(textoResposta)) return Array.Empty<RespostaAnamneseExtraida>();

        var resultado = JsonSerializer.Deserialize<ResultadoIa>(textoResposta, JsonOpcoes);
        if (resultado?.Respostas is null) return Array.Empty<RespostaAnamneseExtraida>();

        var idsValidos = perguntasPendentes.Select(p => p.Id).ToHashSet();

        return resultado.Respostas
            .Where(r => !string.IsNullOrWhiteSpace(r.PerguntaId)
                && idsValidos.Contains(r.PerguntaId)
                && !string.IsNullOrWhiteSpace(r.Resposta))
            .Select(r => new RespostaAnamneseExtraida(r.PerguntaId, r.Resposta))
            .ToList();
    }

    private record ResultadoIa(List<ItemResultadoIa>? Respostas);
    private record ItemResultadoIa(string PerguntaId, string Resposta);
}
