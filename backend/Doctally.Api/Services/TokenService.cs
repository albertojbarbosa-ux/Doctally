using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Doctally.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Doctally.Api.Services;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string GerarToken(Usuario usuario)
    {
        var chave = _config["Jwt:Chave"] ?? throw new InvalidOperationException("Jwt:Chave não configurada.");
        var credenciais = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chave)),
            SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, usuario.Email),
            new("clinica_id", usuario.ClinicaId.ToString()),
            new("papel", usuario.Papel.ToString()),
            new("nome", usuario.Nome),
        };

        if (usuario.EhSuperAdmin)
        {
            claims.Add(new Claim("super_admin", "true"));
        }

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Emissor"],
            audience: _config["Jwt:Audiencia"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credenciais);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
