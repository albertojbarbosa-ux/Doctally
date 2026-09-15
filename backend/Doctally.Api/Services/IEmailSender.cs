namespace Doctally.Api.Services;

public interface IEmailSender
{
    Task EnviarEmailResetSenhaAsync(string destinatarioEmail, string destinatarioNome, string linkReset);
}
