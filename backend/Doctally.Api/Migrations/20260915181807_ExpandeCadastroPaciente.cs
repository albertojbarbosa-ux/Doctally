using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Doctally.Api.Migrations
{
    /// <inheritdoc />
    public partial class ExpandeCadastroPaciente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AlergiasQuais",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bairro",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cep",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CirurgiasInternacoes",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Cns",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ComoConheceuClinica",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Complemento",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DoencaCronicaQuais",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergenciaNome",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergenciaParentesco",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergenciaTelefone",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnderecoNumero",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstadoCivil",
                table: "Pacientes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GrauInstrucao",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Logradouro",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MedicacaoQuais",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Municipio",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nacionalidade",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NaturalidadeMunicipio",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NaturalidadeUf",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeMae",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PontoReferencia",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PossuiAlergias",
                table: "Pacientes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PossuiDoencaCronica",
                table: "Pacientes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Profissao",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsavelCpf",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsavelNome",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsavelParentesco",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsavelRg",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsavelTelefone",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Rg",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RgOrgaoEmissor",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Sexo",
                table: "Pacientes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StatusTabagismo",
                table: "Pacientes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TabagismoDetalhe",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TelefoneFixo",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Uf",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "UsaMedicacaoContinua",
                table: "Pacientes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateOnly>(
                name: "ValidadeConvenio",
                table: "Pacientes",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlergiasQuais",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Bairro",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Cep",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "CirurgiasInternacoes",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Cns",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ComoConheceuClinica",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Complemento",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "DoencaCronicaQuais",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "EmergenciaNome",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "EmergenciaParentesco",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "EmergenciaTelefone",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "EnderecoNumero",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "EstadoCivil",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "GrauInstrucao",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Logradouro",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "MedicacaoQuais",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Municipio",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Nacionalidade",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "NaturalidadeMunicipio",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "NaturalidadeUf",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "NomeMae",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "PontoReferencia",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "PossuiAlergias",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "PossuiDoencaCronica",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Profissao",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ResponsavelCpf",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ResponsavelNome",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ResponsavelParentesco",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ResponsavelRg",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ResponsavelTelefone",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Rg",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "RgOrgaoEmissor",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Sexo",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "StatusTabagismo",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "TabagismoDetalhe",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "TelefoneFixo",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Uf",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "UsaMedicacaoContinua",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ValidadeConvenio",
                table: "Pacientes");
        }
    }
}
