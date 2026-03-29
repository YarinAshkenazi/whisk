using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Whisk.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Nickname = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AuthProvider = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AuthProviderUserId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    BarrelLevel = table.Column<int>(type: "int", nullable: false),
                    HasAcceptedTerms = table.Column<bool>(type: "bit", nullable: false),
                    IsOver18 = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsOnboardingComplete = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WhiskeyCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhiskeyCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Whiskies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Age = table.Column<int>(type: "int", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Region = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Distillery = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    VolumeML = table.Column<int>(type: "int", nullable: false),
                    AlcoholPercentage = table.Column<double>(type: "float", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    BodyProfile = table.Column<double>(type: "float", nullable: false),
                    SmokinessProfile = table.Column<double>(type: "float", nullable: false),
                    SweetnessProfile = table.Column<double>(type: "float", nullable: false),
                    AlcoholProfile = table.Column<double>(type: "float", nullable: true),
                    MinMarketPriceIls = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    MaxMarketPriceIls = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Whiskies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Whiskies_WhiskeyCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "WhiskeyCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CollectionItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WhiskeyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PurchasePriceIls = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    PurchaseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    AddedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CollectionItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CollectionItems_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CollectionItems_Whiskies_WhiskeyId",
                        column: x => x.WhiskeyId,
                        principalTable: "Whiskies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TastingNotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WhiskeyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TastingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsOwned = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    BodyDelta = table.Column<int>(type: "int", nullable: false),
                    SmokeDelta = table.Column<int>(type: "int", nullable: false),
                    SweetDelta = table.Column<int>(type: "int", nullable: false),
                    AlcoholDelta = table.Column<int>(type: "int", nullable: false),
                    PersonalFitPercent = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TastingNotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TastingNotes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TastingNotes_Whiskies_WhiskeyId",
                        column: x => x.WhiskeyId,
                        principalTable: "Whiskies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhiskeyRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Details = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AdminNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ApprovedWhiskeyId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhiskeyRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhiskeyRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WhiskeyRequests_Whiskies_ApprovedWhiskeyId",
                        column: x => x.ApprovedWhiskeyId,
                        principalTable: "Whiskies",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CollectionItems_UserId",
                table: "CollectionItems",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CollectionItems_UserId_WhiskeyId",
                table: "CollectionItems",
                columns: new[] { "UserId", "WhiskeyId" });

            migrationBuilder.CreateIndex(
                name: "IX_CollectionItems_WhiskeyId",
                table: "CollectionItems",
                column: "WhiskeyId");

            migrationBuilder.CreateIndex(
                name: "IX_TastingNotes_UserId",
                table: "TastingNotes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TastingNotes_UserId_WhiskeyId",
                table: "TastingNotes",
                columns: new[] { "UserId", "WhiskeyId" });

            migrationBuilder.CreateIndex(
                name: "IX_TastingNotes_WhiskeyId",
                table: "TastingNotes",
                column: "WhiskeyId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_AuthProvider_AuthProviderUserId",
                table: "Users",
                columns: new[] { "AuthProvider", "AuthProviderUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WhiskeyCategories_Name",
                table: "WhiskeyCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WhiskeyRequests_ApprovedWhiskeyId",
                table: "WhiskeyRequests",
                column: "ApprovedWhiskeyId");

            migrationBuilder.CreateIndex(
                name: "IX_WhiskeyRequests_UserId",
                table: "WhiskeyRequests",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Whiskies_Brand",
                table: "Whiskies",
                column: "Brand");

            migrationBuilder.CreateIndex(
                name: "IX_Whiskies_CategoryId",
                table: "Whiskies",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Whiskies_Country",
                table: "Whiskies",
                column: "Country");

            migrationBuilder.CreateIndex(
                name: "IX_Whiskies_Name",
                table: "Whiskies",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CollectionItems");

            migrationBuilder.DropTable(
                name: "TastingNotes");

            migrationBuilder.DropTable(
                name: "WhiskeyRequests");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Whiskies");

            migrationBuilder.DropTable(
                name: "WhiskeyCategories");
        }
    }
}
