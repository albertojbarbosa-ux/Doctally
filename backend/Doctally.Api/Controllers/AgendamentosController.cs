using Doctally.Api.Data;
using Doctally.Api.DTOs;
using Doctally.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Doctally.Api.Controllers;

[ApiController]
[Route("api/agendamentos")]
[Authorize]
public class AgendamentosController : ControllerBase
{
    private readonly DoctallyDbContext _db;
    private readonly ICurrentTenant _tenant;

    public AgendamentosController(DoctallyDbContext db, ICurrentTenant tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    // Lista os agendamentos de um dia — usado pra desenhar a agenda e calcular horários livres.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgendamentoResponse>>> Listar([FromQuery] DateOnly data)
    {
        var agendamentos = await _db.Agendamentos.AsNoTracking()
            .Where(a => a.Data == data)
            .Include(a => a.Paciente)
            .OrderBy(a => a.Horario)
            .Select(a => new AgendamentoResponse(a.Id, a.PacienteId, a.Paciente!.NomeCompleto, a.Paciente.Telefone, a.Data, a.Horario, a.DuracaoMinutos))
            .ToListAsync();

        return Ok(agendamentos);
    }

    [HttpPost]
    public async Task<ActionResult<AgendamentoResponse>> Criar(CriarAgendamentoRequest request)
    {
        if (_tenant.ClinicaId is null) return BadRequest("Clínica não identificada na requisição.");

        var paciente = await _db.Pacientes.FirstOrDefaultAsync(p => p.Id == request.PacienteId);
        if (paciente is null) return NotFound("Paciente não encontrado.");

        var jaOcupado = await _db.Agendamentos.AnyAsync(a => a.Data == request.Data && a.Horario == request.Horario);
        if (jaOcupado) return Conflict("Esse horário já está ocupado.");

        var agendamento = new Agendamento
        {
            ClinicaId = _tenant.ClinicaId.Value,
            PacienteId = request.PacienteId,
            Data = request.Data,
            Horario = request.Horario,
            DuracaoMinutos = request.DuracaoMinutos,
        };
        _db.Agendamentos.Add(agendamento);
        await _db.SaveChangesAsync();

        return Ok(new AgendamentoResponse(agendamento.Id, paciente.Id, paciente.NomeCompleto, paciente.Telefone, agendamento.Data, agendamento.Horario, agendamento.DuracaoMinutos));
    }

    // Reagenda (muda dia/horário) um agendamento existente. A duração não muda aqui.
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AgendamentoResponse>> Atualizar(Guid id, AtualizarAgendamentoRequest request)
    {
        var agendamento = await _db.Agendamentos.Include(a => a.Paciente).FirstOrDefaultAsync(a => a.Id == id);
        if (agendamento is null) return NotFound();

        var jaOcupado = await _db.Agendamentos.AnyAsync(a =>
            a.Id != id && a.Data == request.Data && a.Horario == request.Horario);
        if (jaOcupado) return Conflict("Esse horário já está ocupado.");

        agendamento.Data = request.Data;
        agendamento.Horario = request.Horario;
        await _db.SaveChangesAsync();

        return Ok(new AgendamentoResponse(agendamento.Id, agendamento.PacienteId, agendamento.Paciente!.NomeCompleto,
            agendamento.Paciente.Telefone, agendamento.Data, agendamento.Horario, agendamento.DuracaoMinutos));
    }

    // Cancela (remove) um agendamento — libera o horário na agenda.
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Cancelar(Guid id)
    {
        var agendamento = await _db.Agendamentos.FirstOrDefaultAsync(a => a.Id == id);
        if (agendamento is null) return NotFound();

        _db.Agendamentos.Remove(agendamento);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
