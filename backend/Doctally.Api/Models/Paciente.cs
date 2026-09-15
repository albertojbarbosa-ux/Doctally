namespace Doctally.Api.Models;

public enum Sexo
{
    Masculino,
    Feminino,
    Outro,
    PrefereNaoInformar
}

public enum EstadoCivil
{
    Solteiro,
    Casado,
    Divorciado,
    Viuvo,
    UniaoEstavel
}

public enum StatusTabagismo
{
    NuncaFumou,
    Fumante,
    ExFumante
}

public class Paciente
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClinicaId { get; set; }
    public Clinica? Clinica { get; set; }

    // 1. Identificação pessoal
    public string NomeCompleto { get; set; } = string.Empty;
    public DateOnly DataNascimento { get; set; }
    public Sexo? Sexo { get; set; }
    public string? NomeMae { get; set; }
    public EstadoCivil? EstadoCivil { get; set; }
    public string? NaturalidadeMunicipio { get; set; }
    public string? NaturalidadeUf { get; set; }
    public string? Nacionalidade { get; set; }
    public string? Profissao { get; set; }
    public string? GrauInstrucao { get; set; }

    // 2. Documentação
    public string Cpf { get; set; } = string.Empty; // criptografar em repouso na camada de persistência
    public string? Rg { get; set; }
    public string? RgOrgaoEmissor { get; set; }
    public string? Cns { get; set; } // Cartão Nacional de Saúde (SUS)
    public string? Convenio { get; set; }
    public string? NumeroCarteirinha { get; set; }
    public DateOnly? ValidadeConvenio { get; set; }

    // 3. Contatos
    public string? Telefone { get; set; } // celular/WhatsApp
    public string? TelefoneFixo { get; set; }
    public string? Email { get; set; }
    public string? ComoConheceuClinica { get; set; }

    // 4. Endereço residencial
    public string? Cep { get; set; }
    public string? Logradouro { get; set; }
    public string? EnderecoNumero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public string? Municipio { get; set; }
    public string? Uf { get; set; }
    public string? PontoReferencia { get; set; }

    // 5. Contato de emergência
    public string? EmergenciaNome { get; set; }
    public string? EmergenciaParentesco { get; set; }
    public string? EmergenciaTelefone { get; set; }

    // 6. Responsável (preencher se paciente menor de idade ou incapaz)
    public string? ResponsavelNome { get; set; }
    public string? ResponsavelCpf { get; set; }
    public string? ResponsavelRg { get; set; }
    public string? ResponsavelParentesco { get; set; }
    public string? ResponsavelTelefone { get; set; }

    // 7. Informações de saúde / anamnese básica
    public bool PossuiAlergias { get; set; }
    public string? AlergiasQuais { get; set; }
    public bool UsaMedicacaoContinua { get; set; }
    public string? MedicacaoQuais { get; set; }
    public StatusTabagismo? StatusTabagismo { get; set; }
    public string? TabagismoDetalhe { get; set; }
    public bool PossuiDoencaCronica { get; set; }
    public string? DoencaCronicaQuais { get; set; }
    public string? CirurgiasInternacoes { get; set; }

    // 8. Termo de consentimento (LGPD) — o checkbox + data funcionam como a
    // "assinatura digital" do termo; não há captura de assinatura manuscrita.
    public bool ConsentimentoLgpd { get; set; }
    public DateTime? ConsentimentoLgpdEm { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
}
