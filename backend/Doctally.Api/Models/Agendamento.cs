namespace Doctally.Api.Models;

// Um horário reservado na agenda da clínica para um paciente. Ainda não vinculado a um
// Atendimento (prontuário) — isso acontece quando a consulta de fato é realizada.
public class Agendamento
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClinicaId { get; set; }
    public Guid PacienteId { get; set; }
    public Paciente? Paciente { get; set; }

    public DateOnly Data { get; set; }
    public TimeOnly Horario { get; set; }
    public int DuracaoMinutos { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
