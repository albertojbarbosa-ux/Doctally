namespace Doctally.Api.Models;

public enum OrigemPreenchimento
{
    Manual,
    IaTranscricao // preenchido a partir da transcrição da consulta (fase futura)
}

public class Atendimento
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public Paciente? Paciente { get; set; }
    public Guid MedicoId { get; set; }
    public Usuario? Medico { get; set; }

    public DateTime DataHora { get; set; } = DateTime.UtcNow;

    // Campos de anamnese/prontuário — estrutura pensada para IA preencher e médico revisar.
    public string? QueixaPrincipal { get; set; }
    public string? HistoriaDoencaAtual { get; set; }
    public string? AntecedentesPessoais { get; set; }
    public string? AntecedentesFamiliares { get; set; }
    public string? ExameFisico { get; set; }
    public string? HipoteseDiagnostica { get; set; }
    public string? Conduta { get; set; }

    public OrigemPreenchimento Origem { get; set; } = OrigemPreenchimento.Manual;
    public bool RevisadoPeloMedico { get; set; } // obrigatório antes de finalizar quando Origem = IaTranscricao

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? FinalizadoEm { get; set; }
}
