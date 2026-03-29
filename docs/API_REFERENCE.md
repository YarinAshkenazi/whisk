# Whisk API Reference

Base URL: `http://localhost:5000/api`

## Authentication
All endpoints except auth require `Authorization: Bearer <token>` header.

### Auth Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/google | Google OAuth login |
| POST | /auth/apple | Apple Sign-In login |
| POST | /auth/dev-login | Dev-only login (Development env) |
| GET | /auth/me | Get current user |

### Profile
| Method | Path | Description |
|--------|------|-------------|
| GET | /profile/me | Get profile |
| PUT | /profile/me | Update profile |
| PUT | /profile/onboarding | Complete onboarding |
| DELETE | /profile/me | Soft delete account |

### Market / Whiskies
| Method | Path | Description |
|--------|------|-------------|
| GET | /whiskies | List with search/filter/sort/pagination |
| GET | /whiskies/{id} | Get bottle details |
| GET | /whiskies/{id}/match | Get match % for current user |
| GET | /categories | List active categories |

### Collection
| Method | Path | Description |
|--------|------|-------------|
| GET | /collection | List user's collection |
| GET | /collection/summary | Collection stats |
| POST | /collection | Add bottle to collection |
| PUT | /collection/{id} | Update collection item |
| DELETE | /collection/{id} | Remove from collection |

### Tastings
| Method | Path | Description |
|--------|------|-------------|
| GET | /tastings | List user's tastings |
| GET | /tastings/{id} | Get tasting details |
| POST | /tastings | Add tasting |
| PUT | /tastings/{id} | Update tasting |
| DELETE | /tastings/{id} | Delete tasting |

### Recommendations
| Method | Path | Description |
|--------|------|-------------|
| GET | /recommendations | Get personalized recommendations |
| GET | /recommendations/status | Check unlock status |

### Whiskey Requests
| Method | Path | Description |
|--------|------|-------------|
| POST | /whiskey-requests | Request missing bottle |
| GET | /whiskey-requests/me | List my requests |

### Admin (Admin role required)
| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/dashboard | Dashboard stats |
| GET | /admin/users | List all users |
| PUT | /admin/users/{id}/status | Activate/deactivate user |
| PUT | /admin/users/{id}/role | Change user role |
| GET | /admin/whiskies | List all whiskies |
| POST | /admin/whiskies | Create whiskey |
| PUT | /admin/whiskies/{id} | Update whiskey |
| DELETE | /admin/whiskies/{id} | Deactivate whiskey |
| GET | /admin/categories | List all categories |
| POST | /admin/categories | Create category |
| PUT | /admin/categories/{id} | Update category |
| DELETE | /admin/categories/{id} | Deactivate category |
| GET | /admin/whiskey-requests | List all requests |
| PUT | /admin/whiskey-requests/{id}/approve | Approve request |
| PUT | /admin/whiskey-requests/{id}/reject | Reject request |
| PUT | /admin/whiskies/{id}/market-prices | Update market prices |

## Health Check
`GET /health` → `{ "status": "healthy", "timestamp": "..." }`
