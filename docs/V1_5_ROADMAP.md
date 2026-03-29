# Whisk V1.5 Roadmap

## Planned Features

### Market Price Scanner
- Automated weekly background job to scan Israeli whisky market prices
- Architecture already supports this via admin-managed prices
- Future: integrate with Israeli retail APIs or scraping service

### Enhanced Recommendations
- Cosine similarity for user matching
- Recency-weighted tastings
- "Because you liked X" explanations
- Cached recommendation refresh (background service)

### Community Features
- Community bottle ratings (aggregate)
- Follow other users
- Public tasting notes (opt-in)

### UI Enhancements
- Bottle image upload from camera
- Dark/light theme toggle
- Animations and transitions
- Haptic feedback

### Business
- Push notifications for price changes
- Wishlist feature
- Barcode scanning for bottle identification
- Multi-currency support

### Technical
- Redis caching layer
- Rate limiting
- API versioning
- Comprehensive integration tests
- CI/CD pipeline
- Production deployment guide
