using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Doctally.Api.Migrations
{
    /// <inheritdoc />
    public partial class AdicionaResetSenhaUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "TokenResetSenhaExpiraEm",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TokenResetSenhaHash",
                table: "Usuarios",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TokenResetSenhaExpiraEm",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "TokenResetSenhaHash",
                table: "Usuarios");
        }
    }
}
