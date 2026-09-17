using Doctally.Api.Data;
using Doctally.Api.DTOs;
using Doctally.Api.Models;
using Doctally.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Doctally.Api.Controllers;

[ApiController]
[Authorize]
public class AtendimentosController : ControllerBase
{
    private readonly DoctallyDbContext _db;
    private readonly ICurrentTenant _tenant;
    private readonly IAnamneseIaService _anamneseIa;

    public AtendimentosController(DoctallyDbContext db, ICurrentTenant tenant, IAnamneseIaService anamneseIa)
    {
        _db = db;
        _tenant = tenant;
        _anamneseIa = anamneseIa;
    }

    // Roteiro padrão de anamnese usado pelo assistente de IA — fonte única compartilhada
    // entre o que a IA procura reconhecer na transcrição e o que aparece na tela do médico.
    [HttpGet("api/anamnese/perguntas-padrao")]
    public ActionResult<IEnumerable<PerguntaAnamneseResponse>> PerguntasPadrao()
    {
        return Ok(CatalogoAnamnese.Perguntas.Select(p =>
            new PerguntaAnamneseResponse(p.Id, p.Secao, p.CampoAlvo, p.Texto)));
    }

    [HttpPost("api/pacientes/{pacienteId:guid}/atendimentos")]
    public async Task<ActionResult<AtendimentoResponse>> Criar(Guid pacienteId)
    {
        if (_tenant.ClinicaId is null) return BadRequest("Clínica não identificada na requisição.");

        var pacienteExiste = await _db.Pacientes.AsNoTracking().AnyAsync(p => p.Id == pacienteId);
        if (!pacienteExiste) return NotFound("Paciente não encontrado.");

        var usuarioIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        Guid.TryParse(usuarioIdClaim, out var medicoId);

        var atendimento = new Atendimento
        {
            ClinicaId = _tenant.ClinicaId.Value,
            PacienteId = pacienteId,
            MedicoId = medicoId,
        };

        _db.Atendimentos.Add(atendimento);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(ObterPorId), new { id = atendimento.Id }, ParaResponse(atendimento));
    }

    // Última consulta finalizada do paciente (para o painel "pontos principais" na tela
    // de anamnese) — ignora atendimentos ainda em andamento/não revisados pelo médico.
    [HttpGet("api/pacientes/{pacienteId:guid}/atendimentos/ultimo")]
    public async Task<ActionResult<AtendimentoResponse>> ObterUltimoFinalizado(Guid pacienteId)
    {
        var atendimento = await _db.Atendimentos.AsNoTracking()
            .Where(a => a.PacienteId == pacienteId && a.FinalizadoEm != null)
            .OrderByDescending(a => a.DataHora)
            .FirstOrDefaultAsync();

        if (atendimento is null) return NotFound();
        return Ok(ParaResponse(atendimento));
    }

    [HttpGet("api/atendimentos/{id:guid}")]
    public async Task<ActionResult<AtendimentoResponse>> ObterPorId(Guid id)
    {
        var atendimento = await _db.Atendimentos.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
        if (atendimento is null) return NotFound();
        return Ok(ParaResponse(atendimento));
    }

    [HttpPut("api/atendimentos/{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, AtualizarAtendimentoRequest request)
    {
        var atendimento = await _db.Atendimentos.FirstOrDefaultAsync(a => a.Id == id);
        if (atendimento is null) return NotFound();

        atendimento.QueixaPrincipal = request.QueixaPrincipal;
        atendimento.HistoriaDoencaAtual = request.HistoriaDoencaAtual;
        atendimento.AntecedentesPessoais = request.AntecedentesPessoais;
        atendimento.AntecedentesFamiliares = request.AntecedentesFamiliares;
        atendimento.RevisadoPeloMedico = request.RevisadoPeloMedico;
        if (request.RevisadoPeloMedico && atendimento.FinalizadoEm is null)
            atendimento.FinalizadoEm = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Processa um novo trecho de transcrição da consulta (captado pelo microfone no
    // navegador do médico) e retorna quais perguntas pendentes a IA identificou como
    // respondidas. Não persiste as respostas — o médico revisa e confirma antes de
    // salvar em Atualizar (acima).
    [HttpPost("api/atendimentos/{id:guid}/anamnese-ia/processar")]
    public async Task<ActionResult<IEnumerable<RespostaAnamneseIaResponse>>> ProcessarAnamneseIa(
        Guid id, ProcessarAnamneseIaRequest request)
    {
        var atendimento = await _db.Atendimentos.FirstOrDefaultAsync(a => a.Id == id);
        if (atendimento is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Transcricao) || request.PerguntasPendentesIds.Length == 0)
            return Ok(Array.Empty<RespostaAnamneseIaResponse>());

        var pendentes = CatalogoAnamnese.Perguntas
            .Where(p => request.PerguntasPendentesIds.Contains(p.Id))
            .ToList();

        var extraidas = await _anamneseIa.ExtrairRespostasAsync(request.Transcricao, pendentes);

        if (extraidas.Count > 0)
        {
            atendimento.Origem = OrigemPreenchimento.IaTranscricao;
            await _db.SaveChangesAsync();
        }

        return Ok(extraidas.Select(r => new RespostaAnamneseIaResponse(r.PerguntaId, r.Resposta)));
    }

    private static AtendimentoResponse ParaResponse(Atendimento a) => new(
        a.Id, a.PacienteId, a.MedicoId, a.DataHora,
        a.QueixaPrincipal, a.HistoriaDoencaAtual, a.AntecedentesPessoais, a.AntecedentesFamiliares,
        a.Origem.ToString(), a.RevisadoPeloMedico, a.FinalizadoEm);
}
