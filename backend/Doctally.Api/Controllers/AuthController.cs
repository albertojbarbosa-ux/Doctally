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

    public AuthController(DoctallyDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    // Cria a clínica e seu primeiro usuário (admin). Endpoint público — é o cadastro do cliente na plataforma.
    [HttpPost("registrar-clinica")]
    public async Task<ActionResult<LoginResponse>> RegistrarClinica(RegistrarClinicaRequest request)
    {
        var emailJaExiste = await _db.Usuarios.IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.EmailAdmin);
        if (emailJaExiste) return Conflict("Já existe um usuário com esse e-mail.");

        var clinica = new Clinica
        {
            Nome = request.NomeClinica,
            Cnpj = request.Cnpj,
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
        return Ok(new LoginResponse(token, admin.Nome, admin.Papel.ToString(), admin.ClinicaId));
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
        return Ok(new LoginResponse(token, usuario.Nome, usuario.Papel.ToString(), usuario.ClinicaId));
    }
}
