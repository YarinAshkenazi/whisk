# Credential Setup Guide

## Google OAuth
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable "Google Sign-In" API
4. Create OAuth 2.0 credentials
5. Add your Android/iOS bundle IDs
6. Set the Client ID in:
   - `server/Whisk.Api/appsettings.json` → `Google:ClientId`
   - `mobile/app.json` → expo.extra.googleClientId (if using expo-auth-session)

## Apple Sign-In
1. Go to https://developer.apple.com
2. Register App ID with Sign In with Apple capability
3. Create Service ID for web authentication
4. Set the Bundle ID in:
   - `server/Whisk.Api/appsettings.json` → `Apple:BundleId`

## JWT Secret
- Change `Jwt:Secret` in production appsettings
- Must be at least 32 characters
- Use a cryptographically random string

## SQL Server
- Development: Uses LocalDB by default
- Production: Update `ConnectionStrings:DefaultConnection`
- The app auto-creates and seeds the database on first run

## Mobile API URL
- Android Emulator: `http://10.0.2.2:5000/api`
- iOS Simulator: `http://localhost:5000/api`
- Physical device: Use your machine's IP address
- Update in `mobile/src/constants/index.js`
