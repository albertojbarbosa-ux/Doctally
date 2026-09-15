namespace Doctally.Api.Models;

// Toda leitura/escrita em dados de paciente/prontuário deve gerar um registro aqui (exigência LGPD).
public class LogAuditoria
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClinicaId { get; set; }
    public Guid UsuarioId { get; set; }
    public string Acao { get; set; } = string.Empty; // ex: "LEITURA_PRONTUARIO", "EDICAO_PACIENTE"
    public string EntidadeTipo { get; set; } = string.Empty;
    public Guid EntidadeId { get; set; }
    public DateTime OcorridoEm { get; set; } = DateTime.UtcNow;
}
