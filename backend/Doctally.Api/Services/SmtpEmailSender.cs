using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Doctally.Api.Services;

public class SmtpEmailSender : IEmailSender
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task EnviarEmailResetSenhaAsync(string destinatarioEmail, string destinatarioNome, string linkReset)
    {
        if (string.IsNullOrWhiteSpace(_options.Host))
        {
            // SMTP ainda não configurado (ex: ambiente local sem as variáveis Smtp__*).
            // Não falha a requisição — só loga o link para permitir testar o fluxo manualmente.
            _logger.LogWarning(
                "Smtp:Host não configurado. E-mail de reset de senha não enviado para {Email}. Link: {Link}",
                destinatarioEmail, linkReset);
            return;
        }

        var mensagem = new MimeMessage();
        mensagem.From.Add(new MailboxAddress(_options.RemetenteNome, _options.RemetenteEmail));
        mensagem.To.Add(new MailboxAddress(destinatarioNome, destinatarioEmail));
        mensagem.Subject = "Redefinição de senha - Doctally";
        mensagem.Body = new TextPart("html")
        {
            Text = $"""
                <p>Olá, {destinatarioNome}.</p>
                <p>Recebemos uma solicitação para redefinir sua senha no Doctally.</p>
                <p><a href="{linkReset}">Clique aqui para criar uma nova senha</a></p>
                <p>Se você não solicitou isso, ignore este e-mail — sua senha continua a mesma.</p>
                <p>O link expira em 30 minutos.</p>
                """
        };

        using var cliente = new SmtpClient();
        await cliente.ConnectAsync(_options.Host, _options.Port, SecureSocketOptions.StartTls);
        if (!string.IsNullOrWhiteSpace(_options.Usuario))
        {
            await cliente.AuthenticateAsync(_options.Usuario, _options.Senha);
        }
        await cliente.SendAsync(mensagem);
        await cliente.DisconnectAsync(true);
    }
}
