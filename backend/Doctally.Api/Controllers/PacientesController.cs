using Doctally.Api.Data;
using Doctally.Api.DTOs;
using Doctally.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Doctally.Api.Controllers;

[ApiController]
[Route("api/pacientes")]
[Authorize]
public class PacientesController : ControllerBase
{
    private readonly DoctallyDbContext _db;
    private readonly ICurrentTenant _tenant;

    public PacientesController(DoctallyDbContext db, ICurrentTenant tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PacienteResponse>>> Listar([FromQuery] string? busca)
    {
        var query = _db.Pacientes.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            query = query.Where(p => p.NomeCompleto.Contains(busca) || p.Cpf.Contains(busca));
        }

        var pacientes = await query
            .OrderBy(p => p.NomeCompleto)
            .Select(p => new PacienteResponse(p.Id, p.NomeCompleto, p.Cpf, p.DataNascimento, p.Telefone, p.Email, p.Convenio, p.ConsentimentoLgpd))
            .ToListAsync();

        return Ok(pacientes);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PacienteResponse>> ObterPorId(Guid id)
    {
        var paciente = await _db.Pacientes.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (paciente is null) return NotFound();

        await RegistrarAuditoria("LEITURA_PACIENTE", paciente.Id);

        return Ok(new PacienteResponse(paciente.Id, paciente.NomeCompleto, paciente.Cpf, paciente.DataNascimento,
            paciente.Telefone, paciente.Email, paciente.Convenio, paciente.ConsentimentoLgpd));
    }

    [HttpPost]
    public async Task<ActionResult<PacienteResponse>> Criar(CriarPacienteRequest request)
    {
        if (_tenant.ClinicaId is null) return BadRequest("Clínica não identificada na requisição.");

        var paciente = new Paciente
        {
            ClinicaId = _tenant.ClinicaId.Value,
            NomeCompleto = request.NomeCompleto,
            Cpf = request.Cpf,
            DataNascimento = request.DataNascimento,
            Telefone = request.Telefone,
            Email = request.Email,
            Convenio = request.Convenio,
            NumeroCarteirinha = request.NumeroCarteirinha,
            ConsentimentoLgpd = request.ConsentimentoLgpd,
            ConsentimentoLgpdEm = request.ConsentimentoLgpd ? DateTime.UtcNow : null
        };

        _db.Pacientes.Add(paciente);
        await _db.SaveChangesAsync();
        await RegistrarAuditoria("CRIACAO_PACIENTE", paciente.Id);

        return CreatedAtAction(nameof(ObterPorId), new { id = paciente.Id },
            new PacienteResponse(paciente.Id, paciente.NomeCompleto, paciente.Cpf, paciente.DataNascimento,
                paciente.Telefone, paciente.Email, paciente.Convenio, paciente.ConsentimentoLgpd));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, CriarPacienteRequest request)
    {
        var paciente = await _db.Pacientes.FirstOrDefaultAsync(p => p.Id == id);
        if (paciente is null) return NotFound();

        paciente.NomeCompleto = request.NomeCompleto;
        paciente.Telefone = request.Telefone;
        paciente.Email = request.Email;
        paciente.Convenio = request.Convenio;
        paciente.NumeroCarteirinha = request.NumeroCarteirinha;
        paciente.AtualizadoEm = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await RegistrarAuditoria("EDICAO_PACIENTE", paciente.Id);

        return NoContent();
    }

    private async Task RegistrarAuditoria(string acao, Guid entidadeId)
    {
        var usuarioIdClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        Guid.TryParse(usuarioIdClaim, out var usuarioId);

        _db.LogsAuditoria.Add(new LogAuditoria
        {
            ClinicaId = _tenant.ClinicaId ?? Guid.Empty,
            UsuarioId = usuarioId,
            Acao = acao,
            EntidadeTipo = nameof(Paciente),
            EntidadeId = entidadeId
        });
        await _db.SaveChangesAsync();
    }
}
