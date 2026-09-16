namespace Doctally.Api.Models;

// CampoAlvo indica em qual campo de texto do Atendimento a resposta é consolidada
// quando o médico salva a anamnese (Atendimento só tem 4 campos narrativos).
public record PerguntaAnamnese(string Id, string Secao, string CampoAlvo, string Texto);

// Roteiro padrão de anamnese, baseado nos modelos consagrados de semiologia médica
// (queixa principal, HDA com atributos de localização/qualidade/irradiação/fatores de
// piora-melhora/duração/intensidade, revisão de sistemas, antecedentes pessoais e
// familiares, hábitos de vida) usados no ensino médico brasileiro. É a fonte única
// tanto do que a IA procura reconhecer na transcrição da consulta quanto do que
// aparece na tela do médico.
public static class CatalogoAnamnese
{
    public static readonly IReadOnlyList<PerguntaAnamnese> Perguntas = new List<PerguntaAnamnese>
    {
        new("qp_1", "Queixa Principal", "QueixaPrincipal", "Qual é a queixa principal? O que trouxe o(a) paciente à consulta hoje?"),

        new("hda_1", "História da Doença Atual", "HistoriaDoencaAtual", "Há quanto tempo o(a) paciente sente isso?"),
        new("hda_2", "História da Doença Atual", "HistoriaDoencaAtual", "Onde exatamente é a localização do sintoma?"),
        new("hda_3", "História da Doença Atual", "HistoriaDoencaAtual", "Como o(a) paciente descreve a característica do sintoma (tipo de dor ou sensação)?"),
        new("hda_4", "História da Doença Atual", "HistoriaDoencaAtual", "O sintoma irradia ou se espalha para algum outro local?"),
        new("hda_5", "História da Doença Atual", "HistoriaDoencaAtual", "O que piora o sintoma?"),
        new("hda_6", "História da Doença Atual", "HistoriaDoencaAtual", "O que melhora o sintoma?"),
        new("hda_7", "História da Doença Atual", "HistoriaDoencaAtual", "O sintoma é constante ou intermitente (vai e volta)?"),
        new("hda_8", "História da Doença Atual", "HistoriaDoencaAtual", "Em uma escala de 0 a 10, qual a intensidade do sintoma?"),
        new("hda_9", "História da Doença Atual", "HistoriaDoencaAtual", "Há outros sintomas associados?"),
        new("hda_10", "História da Doença Atual", "HistoriaDoencaAtual", "O(a) paciente já tentou algum tratamento? Teve melhora?"),

        new("isda_1", "Revisão de Sistemas", "HistoriaDoencaAtual", "O(a) paciente notou febre, calafrios ou perda de peso recente?"),
        new("isda_2", "Revisão de Sistemas", "HistoriaDoencaAtual", "Sente falta de ar, tosse ou dor no peito?"),
        new("isda_3", "Revisão de Sistemas", "HistoriaDoencaAtual", "Notou náuseas, vômitos, alteração de apetite ou do hábito intestinal?"),
        new("isda_4", "Revisão de Sistemas", "HistoriaDoencaAtual", "Sente algum sintoma urinário, como ardência ou aumento da frequência?"),
        new("isda_5", "Revisão de Sistemas", "HistoriaDoencaAtual", "Notou alteração de humor, memória ou sono?"),

        new("ap_1", "Antecedentes Pessoais", "AntecedentesPessoais", "O(a) paciente tem alguma doença diagnosticada atualmente?"),
        new("ap_2", "Antecedentes Pessoais", "AntecedentesPessoais", "Já realizou alguma cirurgia? Quando e qual?"),
        new("ap_3", "Antecedentes Pessoais", "AntecedentesPessoais", "Já precisou ser internado(a)? Por qual motivo?"),
        new("ap_4", "Antecedentes Pessoais", "AntecedentesPessoais", "Usa algum medicamento atualmente, além dos já registrados no cadastro?"),
        new("ap_5", "Antecedentes Pessoais", "AntecedentesPessoais", "Tem alguma alergia a medicamentos, alimentos ou outras substâncias?"),

        new("hv_1", "Hábitos de Vida", "AntecedentesPessoais", "Como é a alimentação do(a) paciente no dia a dia?"),
        new("hv_2", "Hábitos de Vida", "AntecedentesPessoais", "Pratica atividade física? Com que frequência?"),
        new("hv_3", "Hábitos de Vida", "AntecedentesPessoais", "Como está o sono — dorme bem?"),
        new("hv_4", "Hábitos de Vida", "AntecedentesPessoais", "Consome bebida alcoólica? Com que frequência?"),

        new("af_1", "Antecedentes Familiares", "AntecedentesFamiliares", "Há casos de diabetes, hipertensão ou doenças cardíacas na família?"),
        new("af_2", "Antecedentes Familiares", "AntecedentesFamiliares", "Há casos de câncer na família?"),
        new("af_3", "Antecedentes Familiares", "AntecedentesFamiliares", "Algum familiar próximo já teve doença semelhante à do(a) paciente?"),
    }.AsReadOnly();
}
