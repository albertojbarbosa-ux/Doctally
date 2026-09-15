using System.Security.Cryptography;
using Doctally.Api.Data;
using Doctally.Api.DTOs;
using Doctally.Api.Models;
using Doctally.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Doctally.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly DoctallyDbContext _db;
    private readonly TokenService _tokenService;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _config;

    public AuthController(DoctallyDbContext db, TokenService tokenService, IEmailSender emailSender, IConfiguration config)
    {
        _db = db;
        _tokenService = tokenService;
        _emailSender = emailSender;
        _config = config;
    }

    // Cria a clínica e seu primeiro usuário (admin). Endpoint público — é o cadastro do cliente na plataforma.
    [HttpPost("registrar-clinica")]
    public async Task<ActionResult<LoginResponse>> RegistrarClinica(RegistrarClinicaRequest request)
    {
        var emailJaExiste = await _db.Usuarios.IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.EmailAdmin);
        if (emailJaExiste) return Conflict("Já existe um usuário com esse e-mail.");

        if (!Enum.TryParse<TipoPessoa>(request.TipoPessoa, ignoreCase: true, out var tipoPessoa))
            return BadRequest("TipoPessoa deve ser 'Fisica' ou 'Juridica'.");

        if (tipoPessoa == TipoPessoa.Juridica && string.IsNullOrWhiteSpace(request.Cnpj))
            return BadRequest("CNPJ é obrigatório para clínica pessoa jurídica.");
        if (tipoPessoa == TipoPessoa.Fisica && string.IsNullOrWhiteSpace(request.Cpf))
            return BadRequest("CPF é obrigatório para clínica pessoa física.");

        var clinica = new Clinica
        {
            Nome = request.NomeClinica,
            TipoPessoa = tipoPessoa,
            Cnpj = tipoPessoa == TipoPessoa.Juridica ? request.Cnpj : null,
            Cpf = tipoPessoa == TipoPessoa.Fisica ? request.Cpf : null,
        };
        _db.Clinicas.Add(clinica);

        var admin = new Usuario
        {
            ClinicaId = clinica.Id,
            Nome = request.NomeAdmin,
            Email = request.EmailAdmin,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            Papel = PapelUsuario.Admin,
        };
        _db.Usuarios.Add(admin);

        await _db.SaveChangesAsync();

        var token = _tokenService.GerarToken(admin);
        return Ok(new LoginResponse(token, admin.Nome, admin.Papel.ToString(), admin.ClinicaId, admin.EhSuperAdmin));
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        // IgnoreQueryFilters: no login ainda não sabemos a clínica do usuário, então buscamos pelo e-mail globalmente.
        var usuario = await _db.Usuarios.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Ativo);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash))
            return Unauthorized("E-mail ou senha inválidos.");

        var token = _tokenService.GerarToken(usuario);
        return Ok(new LoginResponse(token, usuario.Nome, usuario.Papel.ToString(), usuario.ClinicaId, usuario.EhSuperAdmin));
    }

    // Gera um token de reset e envia por e-mail. Sempre responde 200 com mensagem genérica
    // (mesmo se o e-mail não existir) para não permitir enumeração de usuários cadastrados.
    [HttpPost("esqueci-senha")]
    public async Task<IActionResult> EsqueciSenha(EsqueciSenhaRequest request)
    {
        var usuario = await _db.Usuarios.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.Ativo);

        if (usuario is not null)
        {
            var tokenBruto = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            usuario.TokenResetSenhaHash = HashToken(tokenBruto);
            usuario.TokenResetSenhaExpiraEm = DateTime.UtcNow.AddMinutes(30);
            await _db.SaveChangesAsync();

            var frontendUrl = (_config["FrontendUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var link = $"{frontendUrl}/redefinir-senha?token={tokenBruto}";
            await _emailSender.EnviarEmailResetSenhaAsync(usuario.Email, usuario.Nome, link);
        }

        return Ok(new { mensagem = "Se o e-mail informado estiver cadastrado, enviaremos instruções para redefinir a senha." });
    }

    [HttpPost("redefinir-senha")]
    public async Task<IActionResult> RedefinirSenha(RedefinirSenhaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NovaSenha) || request.NovaSenha.Length < 8)
            return BadRequest("A nova senha deve ter pelo menos 8 caracteres.");

        var tokenHash = HashToken(request.Token);
        var usuario = await _db.Usuarios.IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.TokenResetSenhaHash == tokenHash);

        if (usuario is null || usuario.TokenResetSenhaExpiraEm is null || usuario.TokenResetSenhaExpiraEm < DateTime.UtcNow)
            return BadRequest("Link de redefinição inválido ou expirado. Solicite um novo.");

        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        usuario.TokenResetSenhaHash = null;
        usuario.TokenResetSenhaExpiraEm = null;
        await _db.SaveChangesAsync();

        return Ok(new { mensagem = "Senha redefinida com sucesso." });
    }

    private static string HashToken(string tokenBruto)
    {
        var bytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(tokenBruto));
        return Convert.ToHexString(bytes);
    }
}
