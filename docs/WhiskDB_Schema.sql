IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL,
        [Nickname] nvarchar(50) NOT NULL,
        [Email] nvarchar(256) NOT NULL,
        [Country] nvarchar(100) NOT NULL,
        [AuthProvider] nvarchar(20) NOT NULL,
        [AuthProviderUserId] nvarchar(256) NOT NULL,
        [Role] nvarchar(20) NOT NULL,
        [BarrelLevel] int NOT NULL,
        [HasAcceptedTerms] bit NOT NULL,
        [IsOver18] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [IsOnboardingComplete] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [LastLoginAt] datetime2 NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE TABLE [WhiskeyCategories] (
        [Id] int NOT NULL,
        [Name] nvarchar(100) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_WhiskeyCategories] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE TABLE [Whiskies] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Brand] nvarchar(200) NOT NULL,
        [Age] int NULL,
        [Country] nvarchar(100) NOT NULL,
        [Region] nvarchar(100) NOT NULL,
        [Distillery] nvarchar(200) NOT NULL,
        [CategoryId] int NOT NULL,
        [VolumeML] int NOT NULL,
        [AlcoholPercentage] float NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [Description] nvarchar(2000) NOT NULL,
        [BodyProfile] float NOT NULL,
        [SmokinessProfile] float NOT NULL,
        [SweetnessProfile] float NOT NULL,
        [AlcoholProfile] float NULL,
        [MinMarketPriceIls] decimal(10,2) NOT NULL,
        [MaxMarketPriceIls] decimal(10,2) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Whiskies] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Whiskies_WhiskeyCategories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [WhiskeyCategories] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE TABLE [CollectionItems] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [WhiskeyId] uniqueidentifier NOT NULL,
        [PurchasePriceIls] decimal(10,2) NULL,
        [PurchaseDate] datetime2 NULL,
        [Status] nvarchar(20) NOT NULL,
        [Notes] nvarchar(1000) NOT NULL,
        [AddedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_CollectionItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CollectionItems_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_CollectionItems_Whiskies_WhiskeyId] FOREIGN KEY ([WhiskeyId]) REFERENCES [Whiskies] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE TABLE [TastingNotes] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [WhiskeyId] uniqueidentifier NOT NULL,
        [TastingDate] datetime2 NOT NULL,
        [IsOwned] bit NOT NULL,
        [Notes] nvarchar(2000) NULL,
        [BodyDelta] int NOT NULL,
        [SmokeDelta] int NOT NULL,
        [SweetDelta] int NOT NULL,
        [AlcoholDelta] int NOT NULL,
        [PersonalFitPercent] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_TastingNotes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TastingNotes_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TastingNotes_Whiskies_WhiskeyId] FOREIGN KEY ([WhiskeyId]) REFERENCES [Whiskies] ([Id]) ON DELETE NO ACTION
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE TABLE [WhiskeyRequests] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Brand] nvarchar(200) NOT NULL,
        [Details] nvarchar(1000) NULL,
        [Status] nvarchar(20) NOT NULL,
        [AdminNotes] nvarchar(1000) NULL,
        [ApprovedWhiskeyId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [UpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_WhiskeyRequests] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_WhiskeyRequests_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_WhiskeyRequests_Whiskies_ApprovedWhiskeyId] FOREIGN KEY ([ApprovedWhiskeyId]) REFERENCES [Whiskies] ([Id]) ON DELETE SET NULL
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CollectionItems_UserId] ON [CollectionItems] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CollectionItems_UserId_WhiskeyId] ON [CollectionItems] ([UserId], [WhiskeyId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CollectionItems_WhiskeyId] ON [CollectionItems] ([WhiskeyId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TastingNotes_UserId] ON [TastingNotes] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TastingNotes_UserId_WhiskeyId] ON [TastingNotes] ([UserId], [WhiskeyId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TastingNotes_WhiskeyId] ON [TastingNotes] ([WhiskeyId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_AuthProvider_AuthProviderUserId] ON [Users] ([AuthProvider], [AuthProviderUserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_WhiskeyCategories_Name] ON [WhiskeyCategories] ([Name]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_WhiskeyRequests_ApprovedWhiskeyId] ON [WhiskeyRequests] ([ApprovedWhiskeyId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_WhiskeyRequests_UserId] ON [WhiskeyRequests] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Whiskies_Brand] ON [Whiskies] ([Brand]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Whiskies_CategoryId] ON [Whiskies] ([CategoryId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Whiskies_Country] ON [Whiskies] ([Country]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Whiskies_Name] ON [Whiskies] ([Name]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260329183902_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260329183902_InitialCreate', N'8.0.25');
END;
GO

COMMIT;
GO

