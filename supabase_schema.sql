-- ============================================================
-- Whisk – Full PostgreSQL schema for Supabase
-- Generated from the .NET backend codebase (EF Core model)
-- ============================================================
-- Source files used:
--   Whisk.Domain/Entities/User.cs
--   Whisk.Domain/Entities/Whiskey.cs
--   Whisk.Domain/Entities/WhiskeyCategory.cs
--   Whisk.Domain/Entities/CollectionItem.cs
--   Whisk.Domain/Entities/TastingNote.cs
--   Whisk.Domain/Entities/WhiskeyRequest.cs
--   Whisk.Domain/Enums/AuthProvider.cs        (Google, Apple, Dev)
--   Whisk.Domain/Enums/UserRole.cs            (User, Admin)
--   Whisk.Domain/Enums/CollectionStatus.cs    (Closed, Opened, Finished)
--   Whisk.Domain/Enums/WhiskeyRequestStatus.cs(Pending, Approved, Rejected)
--   Whisk.Infrastructure/Persistence/WhiskDbContext.cs
--   Whisk.Infrastructure/Persistence/SeedData.cs
--   Whisk.Infrastructure/Migrations/* (3 migrations)
--   Whisk.Application/DTOs/Dtos.cs
--   Whisk.Application/Interfaces/IWhiskDbContext.cs
-- ============================================================

-- Drop existing tables (safe for fresh Supabase project)
DROP TABLE IF EXISTS "WhiskeyRequests"  CASCADE;
DROP TABLE IF EXISTS "TastingNotes"     CASCADE;
DROP TABLE IF EXISTS "CollectionItems"  CASCADE;
DROP TABLE IF EXISTS "Whiskies"         CASCADE;
DROP TABLE IF EXISTS "WhiskeyCategories" CASCADE;
DROP TABLE IF EXISTS "Users"            CASCADE;

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────────────
-- 1. Users
-- ────────────────────────────────────────────────────────
CREATE TABLE "Users" (
    "Id"                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    "Nickname"              VARCHAR(50)     NOT NULL,
    "Email"                 VARCHAR(256)    NOT NULL,
    "PasswordHash"          VARCHAR(512),
    "Country"               VARCHAR(100)    NOT NULL DEFAULT '',
    "AuthProvider"          VARCHAR(20)     NOT NULL,          -- 'Google','Apple','Dev'
    "AuthProviderUserId"    VARCHAR(256)    NOT NULL,
    "Role"                  VARCHAR(20)     NOT NULL DEFAULT 'User', -- 'User','Admin'
    "BarrelLevel"           INTEGER         NOT NULL DEFAULT 0,
    "HasAcceptedTerms"      BOOLEAN         NOT NULL DEFAULT FALSE,
    "IsOver18"              BOOLEAN         NOT NULL DEFAULT FALSE,
    "IsActive"              BOOLEAN         NOT NULL DEFAULT TRUE,
    "IsOnboardingComplete"  BOOLEAN         NOT NULL DEFAULT FALSE,
    "ExpoPushToken"         VARCHAR(256),
    "CreatedAt"             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "UpdatedAt"             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "LastLoginAt"           TIMESTAMPTZ
);

CREATE UNIQUE INDEX "IX_Users_Email"
    ON "Users" ("Email");

CREATE UNIQUE INDEX "IX_Users_AuthProvider_AuthProviderUserId"
    ON "Users" ("AuthProvider", "AuthProviderUserId");

-- ────────────────────────────────────────────────────────
-- 2. WhiskeyCategories
-- ────────────────────────────────────────────────────────
CREATE TABLE "WhiskeyCategories" (
    "Id"        INTEGER         PRIMARY KEY,   -- NOT auto-generated
    "Name"      VARCHAR(100)    NOT NULL,
    "IsActive"  BOOLEAN         NOT NULL DEFAULT TRUE,
    "CreatedAt" TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "IX_WhiskeyCategories_Name"
    ON "WhiskeyCategories" ("Name");

-- ────────────────────────────────────────────────────────
-- 3. Whiskies
-- ────────────────────────────────────────────────────────
CREATE TABLE "Whiskies" (
    "Id"                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name"                VARCHAR(200)      NOT NULL,
    "Brand"               VARCHAR(200)      NOT NULL,
    "Age"                 INTEGER,
    "Country"             VARCHAR(100)      NOT NULL,
    "Region"              VARCHAR(100)      NOT NULL DEFAULT '',
    "Distillery"          VARCHAR(200)      NOT NULL DEFAULT '',
    "CategoryId"          INTEGER           NOT NULL
                              REFERENCES "WhiskeyCategories"("Id")
                              ON DELETE RESTRICT,
    "VolumeML"            INTEGER           NOT NULL DEFAULT 0,
    "AlcoholPercentage"   DOUBLE PRECISION  NOT NULL DEFAULT 0,
    "ImageUrl"            VARCHAR(500)      NOT NULL DEFAULT '',
    "Description"         VARCHAR(2000)     NOT NULL DEFAULT '',
    "BodyProfile"         DOUBLE PRECISION  NOT NULL DEFAULT 0,
    "SmokinessProfile"    DOUBLE PRECISION  NOT NULL DEFAULT 0,
    "SweetnessProfile"    DOUBLE PRECISION  NOT NULL DEFAULT 0,
    "AlcoholProfile"      DOUBLE PRECISION,
    "MinMarketPriceIls"   NUMERIC(10,2)     NOT NULL DEFAULT 0,
    "MaxMarketPriceIls"   NUMERIC(10,2)     NOT NULL DEFAULT 0,
    "IsActive"            BOOLEAN           NOT NULL DEFAULT TRUE,
    "CreatedAt"           TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    "UpdatedAt"           TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX "IX_Whiskies_Name"       ON "Whiskies" ("Name");
CREATE INDEX "IX_Whiskies_Brand"      ON "Whiskies" ("Brand");
CREATE INDEX "IX_Whiskies_Country"    ON "Whiskies" ("Country");
CREATE INDEX "IX_Whiskies_CategoryId" ON "Whiskies" ("CategoryId");

-- ────────────────────────────────────────────────────────
-- 4. CollectionItems
-- ────────────────────────────────────────────────────────
CREATE TABLE "CollectionItems" (
    "Id"                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"            UUID            NOT NULL
                            REFERENCES "Users"("Id")
                            ON DELETE CASCADE,
    "WhiskeyId"         UUID            NOT NULL
                            REFERENCES "Whiskies"("Id")
                            ON DELETE RESTRICT,
    "PurchasePriceIls"  NUMERIC(10,2),
    "PurchaseDate"      TIMESTAMPTZ,
    "Status"            VARCHAR(20)     NOT NULL DEFAULT 'Closed', -- 'Closed','Opened','Finished'
    "Notes"             VARCHAR(1000)   NOT NULL DEFAULT '',
    "AddedAt"           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX "IX_CollectionItems_UserId"              ON "CollectionItems" ("UserId");
CREATE INDEX "IX_CollectionItems_WhiskeyId"           ON "CollectionItems" ("WhiskeyId");
CREATE INDEX "IX_CollectionItems_UserId_WhiskeyId"    ON "CollectionItems" ("UserId", "WhiskeyId");

-- ────────────────────────────────────────────────────────
-- 5. TastingNotes
-- ────────────────────────────────────────────────────────
CREATE TABLE "TastingNotes" (
    "Id"                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"            UUID            NOT NULL
                            REFERENCES "Users"("Id")
                            ON DELETE CASCADE,
    "WhiskeyId"         UUID            NOT NULL
                            REFERENCES "Whiskies"("Id")
                            ON DELETE RESTRICT,
    "TastingDate"       TIMESTAMPTZ     NOT NULL,
    "IsOwned"           BOOLEAN         NOT NULL DEFAULT FALSE,
    "Notes"             VARCHAR(2000),
    "BodyDelta"         INTEGER         NOT NULL DEFAULT 0,
    "SmokeDelta"        INTEGER         NOT NULL DEFAULT 0,
    "SweetDelta"        INTEGER         NOT NULL DEFAULT 0,
    "AlcoholDelta"      INTEGER         NOT NULL DEFAULT 0,
    "PersonalFitPercent" INTEGER        NOT NULL DEFAULT 0,
    "CreatedAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX "IX_TastingNotes_UserId"              ON "TastingNotes" ("UserId");
CREATE INDEX "IX_TastingNotes_WhiskeyId"           ON "TastingNotes" ("WhiskeyId");
CREATE INDEX "IX_TastingNotes_UserId_WhiskeyId"    ON "TastingNotes" ("UserId", "WhiskeyId");

-- ────────────────────────────────────────────────────────
-- 6. WhiskeyRequests
-- ────────────────────────────────────────────────────────
CREATE TABLE "WhiskeyRequests" (
    "Id"                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId"              UUID            NOT NULL
                              REFERENCES "Users"("Id")
                              ON DELETE CASCADE,
    "Name"                VARCHAR(200)    NOT NULL,
    "Brand"               VARCHAR(200)    NOT NULL,
    "Details"             VARCHAR(1000),
    "Status"              VARCHAR(20)     NOT NULL DEFAULT 'Pending', -- 'Pending','Approved','Rejected'
    "AdminNotes"          VARCHAR(1000),
    "ApprovedWhiskeyId"   UUID
                              REFERENCES "Whiskies"("Id")
                              ON DELETE SET NULL,
    "NotificationSentAt"  TIMESTAMPTZ,
    "CreatedAt"           TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "UpdatedAt"           TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX "IX_WhiskeyRequests_UserId"            ON "WhiskeyRequests" ("UserId");
CREATE INDEX "IX_WhiskeyRequests_ApprovedWhiskeyId" ON "WhiskeyRequests" ("ApprovedWhiskeyId");


-- ============================================================
-- SEED DATA  (minimal demo set)
-- ============================================================

-- ── Categories ──
INSERT INTO "WhiskeyCategories" ("Id", "Name") VALUES
    (1, 'Single Malt Scotch'),
    (2, 'Blended Scotch'),
    (3, 'Japanese'),
    (4, 'Irish'),
    (5, 'Indian'),
    (6, 'Israeli');

-- ── Users ──
-- PasswordHash is NULL here; the .NET backend will populate it
-- on first dev-login or you can set it from the app.
INSERT INTO "Users"
    ("Id", "Nickname", "Email", "Country",
     "AuthProvider", "AuthProviderUserId",
     "Role", "BarrelLevel",
     "HasAcceptedTerms", "IsOver18", "IsActive", "IsOnboardingComplete")
VALUES
    ('11111111-1111-1111-1111-111111111111',
     'Admin', 'admin@whisk.dev', 'Israel',
     'Dev', 'dev-admin',
     'Admin', 0,
     TRUE, TRUE, TRUE, TRUE),

    ('22222222-2222-2222-2222-222222222222',
     'WhiskyLover', 'user@whisk.dev', 'Israel',
     'Dev', 'dev-user',
     'User', 1,
     TRUE, TRUE, TRUE, TRUE);

-- ── Whiskies (8 representative bottles) ──
INSERT INTO "Whiskies"
    ("Id","Name","Brand","Age","Country","Region","Distillery","CategoryId",
     "VolumeML","AlcoholPercentage","ImageUrl","Description",
     "BodyProfile","SmokinessProfile","SweetnessProfile","AlcoholProfile",
     "MinMarketPriceIls","MaxMarketPriceIls")
VALUES
    ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa',
     'Glenfiddich 12 Year Old','Glenfiddich',12,'Scotland','Speyside','Glenfiddich',1,
     700,40.0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
     'A beautifully crafted single malt. Fresh and fruity with a hint of pear.',
     4,1,6,3, 150,220),

    ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa',
     'The Macallan 12 Double Cask','The Macallan',12,'Scotland','Speyside','The Macallan',1,
     700,40.0,'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
     'Rich and balanced with notes of dried fruits, sherry, and warm spice.',
     6,1,7,4, 280,380),

    ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa',
     'Laphroaig 10 Year Old','Laphroaig',10,'Scotland','Islay','Laphroaig',1,
     700,40.0,'https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400',
     'Boldly peated with seaweed, iodine, and a hint of sweetness.',
     7,9,2,4, 180,260),

    ('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa',
     'Johnnie Walker Black Label','Johnnie Walker',12,'Scotland','Blended','Various',2,
     700,40.0,'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
     'A deep complex blend with smoky malt, rich fruit, and vanilla.',
     5,5,5,4, 120,170),

    ('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa',
     'Hibiki Harmony','Hibiki',NULL,'Japan','Osaka','Suntory',3,
     700,43.0,'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
     'A delicate harmony of malt and grain whiskies. Honey, orange peel, and white chocolate.',
     5,1,7,4, 400,550),

    ('aaaaaaaa-0006-0006-0006-aaaaaaaaaaaa',
     'Jameson Irish Whiskey','Jameson',NULL,'Ireland','Cork','Midleton',4,
     700,40.0,'https://images.unsplash.com/photo-1602081115068-1b1049788852?w=400',
     'Smooth and versatile triple-distilled whiskey with vanilla and toasted wood.',
     3,1,5,3, 80,130),

    ('aaaaaaaa-0007-0007-0007-aaaaaaaaaaaa',
     'Amrut Fusion','Amrut',NULL,'India','Bangalore','Amrut',5,
     700,50.0,'https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400',
     'A fusion of Indian and Scottish barley. Rich, complex with dark chocolate.',
     7,4,5,7, 250,350),

    ('aaaaaaaa-0008-0008-0008-aaaaaaaaaaaa',
     'Milk & Honey Classic','Milk & Honey',NULL,'Israel','Tel Aviv','M&H',6,
     700,46.0,'https://images.unsplash.com/photo-1574783541427-d6ab90fc7669?w=400',
     'Israel''s first whisky distillery. Citrus, caramel, and young oak.',
     5,2,5,5, 200,280);

-- ── CollectionItems (test user owns first 3 whiskies) ──
INSERT INTO "CollectionItems"
    ("Id","UserId","WhiskeyId","PurchasePriceIls","PurchaseDate","Status","Notes")
VALUES
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', 170, NOW() - INTERVAL '30 days', 'Closed', 'Great bottle'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', 300, NOW() - INTERVAL '45 days', 'Closed', 'Gift from a friend'),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', 200, NOW() - INTERVAL '15 days', 'Opened', 'Very smoky');

-- ── TastingNotes (test user, 4 tastings to unlock recommendations) ──
INSERT INTO "TastingNotes"
    ("Id","UserId","WhiskeyId","TastingDate","IsOwned","Notes",
     "BodyDelta","SmokeDelta","SweetDelta","AlcoholDelta","PersonalFitPercent")
VALUES
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', NOW() - INTERVAL '25 days',
     TRUE, 'Light and fruity',  1, -1, 2, 0, 88),

    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', NOW() - INTERVAL '20 days',
     TRUE, 'Rich sherry notes', 2, 0, 3, 1, 80),

    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', NOW() - INTERVAL '10 days',
     TRUE, 'Peat monster!',     3, 4, -2, 1, 62),

    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     'aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', NOW() - INTERVAL '5 days',
     FALSE, 'Tried at a bar',   0, 1, 1, 0, 90);

-- ── WhiskeyRequests (one pending from test user) ──
INSERT INTO "WhiskeyRequests"
    ("Id","UserId","Name","Brand","Details","Status")
VALUES
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
     'Springbank 15', 'Springbank',
     'Would love to see this added to the catalog!', 'Pending');

-- ============================================================
-- Done. Schema + seed data ready for Supabase.
-- ============================================================
