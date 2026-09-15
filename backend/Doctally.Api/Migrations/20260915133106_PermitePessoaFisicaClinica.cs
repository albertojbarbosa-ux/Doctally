using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Doctally.Api.Migrations
{
    /// <inheritdoc />
    public partial class PermitePessoaFisicaClinica : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EhSuperAdmin",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "Cnpj",
                table: "Clinicas",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "Cpf",
                table: "Clinicas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeCustomerId",
                table: "Clinicas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TipoPessoa",
                table: "Clinicas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Modulos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Chave = table.Column<string>(type: "text", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    PrecoMensalCentavos = table.Column<int>(type: "integer", nullable: false),
                    StripePriceId = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Modulos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ClinicaModulos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClinicaId = table.Column<Guid>(type: "uuid", nullable: false),
                    ModuloId = table.Column<Guid>(type: "uuid", nullable: false),
                    Origem = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: true),
                    StripeSubscriptionId = table.Column<string>(type: "text", nullable: true),
                    MotivoCortesia = table.Column<string>(type: "text", nullable: true),
                    ConcedidoPorUsuarioId = table.Column<Guid>(type: "uuid", nullable: true),
                    AtivoDesde = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtivoAte = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClinicaModulos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClinicaModulos_Clinicas_ClinicaId",
                        column: x => x.ClinicaId,
                        principalTable: "Clinicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClinicaModulos_Modulos_ModuloId",
                        column: x => x.ModuloId,
                        principalTable: "Modulos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clinicas_Cnpj",
                table: "Clinicas",
                column: "Cnpj",
                unique: true,
                filter: "\"Cnpj\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Clinicas_Cpf",
                table: "Clinicas",
                column: "Cpf",
                unique: true,
                filter: "\"Cpf\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_ClinicaModulos_ClinicaId_ModuloId",
                table: "ClinicaModulos",
                columns: new[] { "ClinicaId", "ModuloId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClinicaModulos_ModuloId",
                table: "ClinicaModulos",
                column: "ModuloId");

            migrationBuilder.CreateIndex(
                name: "IX_Modulos_Chave",
                table: "Modulos",
                column: "Chave",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClinicaModulos");

            migrationBuilder.DropTable(
                name: "Modulos");

            migrationBuilder.DropIndex(
                name: "IX_Clinicas_Cnpj",
                table: "Clinicas");

            migrationBuilder.DropIndex(
                name: "IX_Clinicas_Cpf",
                table: "Clinicas");

            migrationBuilder.DropColumn(
                name: "EhSuperAdmin",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Cpf",
                table: "Clinicas");

            migrationBuilder.DropColumn(
                name: "StripeCustomerId",
                table: "Clinicas");

            migrationBuilder.DropColumn(
                name: "TipoPessoa",
                table: "Clinicas");

            migrationBuilder.AlterColumn<string>(
                name: "Cnpj",
                table: "Clinicas",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
