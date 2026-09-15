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

        var pacientes = await query.OrderBy(p => p.NomeCompleto).ToListAsync();
        return Ok(pacientes.Select(ParaResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PacienteResponse>> ObterPorId(Guid id)
    {
        var paciente = await _db.Pacientes.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
        if (paciente is null) return NotFound();

        await RegistrarAuditoria("LEITURA_PACIENTE", paciente.Id);
        return Ok(ParaResponse(paciente));
    }

    [HttpPost]
    public async Task<ActionResult<PacienteResponse>> Criar(CriarPacienteRequest request)
    {
        if (_tenant.ClinicaId is null) return BadRequest("Clínica não identificada na requisição.");

        if (!TentarParsearEnum<Sexo>(request.Sexo, out var sexo))
            return BadRequest("Sexo inválido.");
        if (!TentarParsearEnum<EstadoCivil>(request.EstadoCivil, out var estadoCivil))
            return BadRequest("Estado civil inválido.");
        if (!TentarParsearEnum<StatusTabagismo>(request.StatusTabagismo, out var tabagismo))
            return BadRequest("Status de tabagismo inválido.");

        var paciente = new Paciente
        {
            ClinicaId = _tenant.ClinicaId.Value,
            NomeCompleto = request.NomeCompleto,
            DataNascimento = request.DataNascimento,
            Sexo = sexo,
            NomeMae = request.NomeMae,
            EstadoCivil = estadoCivil,
            NaturalidadeMunicipio = request.NaturalidadeMunicipio,
            NaturalidadeUf = request.NaturalidadeUf,
            Nacionalidade = request.Nacionalidade,
            Profissao = request.Profissao,
            GrauInstrucao = request.GrauInstrucao,
            Cpf = request.Cpf,
            Rg = request.Rg,
            RgOrgaoEmissor = request.RgOrgaoEmissor,
            Cns = request.Cns,
            Convenio = request.Convenio,
            NumeroCarteirinha = request.NumeroCarteirinha,
            ValidadeConvenio = request.ValidadeConvenio,
            Telefone = request.Telefone,
            TelefoneFixo = request.TelefoneFixo,
            Email = request.Email,
            ComoConheceuClinica = request.ComoConheceuClinica,
            Cep = request.Cep,
            Logradouro = request.Logradouro,
            EnderecoNumero = request.EnderecoNumero,
            Complemento = request.Complemento,
            Bairro = request.Bairro,
            Municipio = request.Municipio,
            Uf = request.Uf,
            PontoReferencia = request.PontoReferencia,
            EmergenciaNome = request.EmergenciaNome,
            EmergenciaParentesco = request.EmergenciaParentesco,
            EmergenciaTelefone = request.EmergenciaTelefone,
            ResponsavelNome = request.ResponsavelNome,
            ResponsavelCpf = request.ResponsavelCpf,
            ResponsavelRg = request.ResponsavelRg,
            ResponsavelParentesco = request.ResponsavelParentesco,
            ResponsavelTelefone = request.ResponsavelTelefone,
            PossuiAlergias = request.PossuiAlergias,
            AlergiasQuais = request.AlergiasQuais,
            UsaMedicacaoContinua = request.UsaMedicacaoContinua,
            MedicacaoQuais = request.MedicacaoQuais,
            StatusTabagismo = tabagismo,
            TabagismoDetalhe = request.TabagismoDetalhe,
            PossuiDoencaCronica = request.PossuiDoencaCronica,
            DoencaCronicaQuais = request.DoencaCronicaQuais,
            CirurgiasInternacoes = request.CirurgiasInternacoes,
            ConsentimentoLgpd = request.ConsentimentoLgpd,
            ConsentimentoLgpdEm = request.ConsentimentoLgpd ? DateTime.UtcNow : null,
        };

        _db.Pacientes.Add(paciente);
        await _db.SaveChangesAsync();
        await RegistrarAuditoria("CRIACAO_PACIENTE", paciente.Id);

        return CreatedAtAction(nameof(ObterPorId), new { id = paciente.Id }, ParaResponse(paciente));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(Guid id, CriarPacienteRequest request)
    {
        var paciente = await _db.Pacientes.FirstOrDefaultAsync(p => p.Id == id);
        if (paciente is null) return NotFound();

        if (!TentarParsearEnum<Sexo>(request.Sexo, out var sexo))
            return BadRequest("Sexo inválido.");
        if (!TentarParsearEnum<EstadoCivil>(request.EstadoCivil, out var estadoCivil))
            return BadRequest("Estado civil inválido.");
        if (!TentarParsearEnum<StatusTabagismo>(request.StatusTabagismo, out var tabagismo))
            return BadRequest("Status de tabagismo inválido.");

        paciente.NomeCompleto = request.NomeCompleto;
        paciente.DataNascimento = request.DataNascimento;
        paciente.Sexo = sexo;
        paciente.NomeMae = request.NomeMae;
        paciente.EstadoCivil = estadoCivil;
        paciente.NaturalidadeMunicipio = request.NaturalidadeMunicipio;
        paciente.NaturalidadeUf = request.NaturalidadeUf;
        paciente.Nacionalidade = request.Nacionalidade;
        paciente.Profissao = request.Profissao;
        paciente.GrauInstrucao = request.GrauInstrucao;
        paciente.Rg = request.Rg;
        paciente.RgOrgaoEmissor = request.RgOrgaoEmissor;
        paciente.Cns = request.Cns;
        paciente.Convenio = request.Convenio;
        paciente.NumeroCarteirinha = request.NumeroCarteirinha;
        paciente.ValidadeConvenio = request.ValidadeConvenio;
        paciente.Telefone = request.Telefone;
        paciente.TelefoneFixo = request.TelefoneFixo;
        paciente.Email = request.Email;
        paciente.ComoConheceuClinica = request.ComoConheceuClinica;
        paciente.Cep = request.Cep;
        paciente.Logradouro = request.Logradouro;
        paciente.EnderecoNumero = request.EnderecoNumero;
        paciente.Complemento = request.Complemento;
        paciente.Bairro = request.Bairro;
        paciente.Municipio = request.Municipio;
        paciente.Uf = request.Uf;
        paciente.PontoReferencia = request.PontoReferencia;
        paciente.EmergenciaNome = request.EmergenciaNome;
        paciente.EmergenciaParentesco = request.EmergenciaParentesco;
        paciente.EmergenciaTelefone = request.EmergenciaTelefone;
        paciente.ResponsavelNome = request.ResponsavelNome;
        paciente.ResponsavelCpf = request.ResponsavelCpf;
        paciente.ResponsavelRg = request.ResponsavelRg;
        paciente.ResponsavelParentesco = request.ResponsavelParentesco;
        paciente.ResponsavelTelefone = request.ResponsavelTelefone;
        paciente.PossuiAlergias = request.PossuiAlergias;
        paciente.AlergiasQuais = request.AlergiasQuais;
        paciente.UsaMedicacaoContinua = request.UsaMedicacaoContinua;
        paciente.MedicacaoQuais = request.MedicacaoQuais;
        paciente.StatusTabagismo = tabagismo;
        paciente.TabagismoDetalhe = request.TabagismoDetalhe;
        paciente.PossuiDoencaCronica = request.PossuiDoencaCronica;
        paciente.DoencaCronicaQuais = request.DoencaCronicaQuais;
        paciente.CirurgiasInternacoes = request.CirurgiasInternacoes;
        paciente.AtualizadoEm = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await RegistrarAuditoria("EDICAO_PACIENTE", paciente.Id);

        return NoContent();
    }

    private static PacienteResponse ParaResponse(Paciente p) => new(
        p.Id, p.NomeCompleto, p.DataNascimento, p.Sexo?.ToString(), p.NomeMae, p.EstadoCivil?.ToString(),
        p.NaturalidadeMunicipio, p.NaturalidadeUf, p.Nacionalidade, p.Profissao, p.GrauInstrucao,
        p.Cpf, p.Rg, p.RgOrgaoEmissor, p.Cns, p.Convenio, p.NumeroCarteirinha, p.ValidadeConvenio,
        p.Telefone, p.TelefoneFixo, p.Email, p.ComoConheceuClinica,
        p.Cep, p.Logradouro, p.EnderecoNumero, p.Complemento, p.Bairro, p.Municipio, p.Uf, p.PontoReferencia,
        p.EmergenciaNome, p.EmergenciaParentesco, p.EmergenciaTelefone,
        p.ResponsavelNome, p.ResponsavelCpf, p.ResponsavelRg, p.ResponsavelParentesco, p.ResponsavelTelefone,
        p.PossuiAlergias, p.AlergiasQuais, p.UsaMedicacaoContinua, p.MedicacaoQuais,
        p.StatusTabagismo?.ToString(), p.TabagismoDetalhe, p.PossuiDoencaCronica, p.DoencaCronicaQuais,
        p.CirurgiasInternacoes, p.ConsentimentoLgpd);

    // Campo vazio/nulo é válido (a maioria destes campos é opcional); só rejeita valor
    // preenchido que não bate com nenhum valor do enum.
    private static bool TentarParsearEnum<TEnum>(string? valor, out TEnum? resultado) where TEnum : struct, Enum
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            resultado = null;
            return true;
        }
        if (Enum.TryParse<TEnum>(valor, ignoreCase: true, out var parsed))
        {
            resultado = parsed;
            return true;
        }
        resultado = null;
        return false;
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
