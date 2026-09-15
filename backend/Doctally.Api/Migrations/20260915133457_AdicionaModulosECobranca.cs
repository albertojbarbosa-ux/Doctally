using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Doctally.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaModulosECobranca : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Modulos",
                columns: new[] { "Id", "Ativo", "Chave", "Descricao", "Nome", "PrecoMensalCentavos", "StripePriceId" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), true, "prontuarios", "Prontuário e anamnese estruturada por atendimento.", "Prontuário Eletrônico", 9900, null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), true, "receitas", "Emissão de receituário simples e controlado.", "Receituário", 9900, null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), true, "faturamento", "Faturamento de consultas e convênios.", "Faturamento", 14900, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Modulos",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Modulos",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "Modulos",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));
        }
    }
}
