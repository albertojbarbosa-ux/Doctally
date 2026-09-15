namespace Doctally.Api.Services;

public class EmailOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string Usuario { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
    public string RemetenteEmail { get; set; } = "nao-responda@doctally.com.br";
    public string RemetenteNome { get; set; } = "Doctally";
}
