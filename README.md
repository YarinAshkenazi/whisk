# Whisk - Whisky Enthusiast App

A mobile-only whisky enthusiast app for browsing the market, tracking collections, recording tastings, and getting personalized recommendations.

## Tech Stack

### Backend
- ASP.NET Core 8 Web API
- SQL Server (LocalDB for dev)
- Entity Framework Core (code-first)
- JWT Authentication
- Clean Architecture
- FluentValidation
- Swagger

### Mobile
- React Native with Expo
- JavaScript
- React Query
- Zustand
- React Navigation
- Axios

## Project Structure

```
whisk/
├── server/                  # Backend solution
│   ├── Whisk.Api/          # Controllers, middleware, DI
│   ├── Whisk.Application/  # DTOs, interfaces, validators
│   ├── Whisk.Domain/       # Entities, enums, domain services
│   ├── Whisk.Infrastructure/ # EF Core, persistence, services
│   └── Whisk.Tests/        # Unit & integration tests
├── mobile/                  # Expo React Native app
│   └── src/
│       ├── api/            # API client & endpoints
│       ├── components/     # Reusable UI components
│       ├── hooks/          # React Query hooks
│       ├── navigation/     # React Navigation setup
│       ├── screens/        # All app screens
│       ├── store/          # Zustand auth store
│       ├── theme/          # Colors, spacing, typography
│       ├── constants/      # App constants
│       └── utils/          # Utility functions
├── docs/                   # Documentation
└── scripts/               # Helper scripts
```

## Quick Start

### Prerequisites
- .NET 8+ SDK
- Node.js 18+ & npm
- SQL Server or LocalDB
- Expo CLI (`npm install -g expo-cli`)
- Android/iOS emulator or Expo Go app

### Backend Setup

```bash
cd server

# Apply migrations and start (auto-seeds data)
dotnet run --project Whisk.Api

# API available at http://localhost:5000
# Swagger at http://localhost:5000/swagger
```

### Mobile Setup

```bash
cd mobile
npm install

# Start Expo
npx expo start
```

### Dev Login (No OAuth Required)
The backend includes a development-only login endpoint. Use from Swagger or the app's dev login buttons:

```
POST /api/auth/dev-login
{ "email": "admin@whisk.dev", "role": "Admin" }
{ "email": "user@whisk.dev", "role": "User" }
```

## Seed Data
The database auto-seeds on first run with:
- 6 whiskey categories
- 30 realistic whiskies with prices in ILS
- 1 admin user (admin@whisk.dev)
- 1 test user (user@whisk.dev) with collection items and tastings
- 2 pending bottle requests

## Testing

```bash
cd server
dotnet test --verbosity normal
```

## Configuration

### Backend (server/Whisk.Api/appsettings.Development.json)
- `ConnectionStrings:DefaultConnection` - SQL Server connection string
- `Jwt:Secret` - JWT signing key (min 32 chars)
- `Google:ClientId` - Google OAuth client ID
- `Apple:BundleId` - Apple app bundle ID

### Mobile (mobile/src/constants/index.js)
- `API_URL` - Backend URL (defaults to http://10.0.2.2:5000/api for Android emulator)

## License
Private - All rights reserved
