# Whisk QA Checklist - V1

## Authentication
- [ ] Dev login as User works
- [ ] Dev login as Admin works
- [ ] Token is stored securely
- [ ] Unauthorized requests redirect to login
- [ ] Google Sign-In scaffold ready (needs real credentials)
- [ ] Apple Sign-In scaffold ready (needs real credentials)

## Onboarding
- [ ] First login shows onboarding screen
- [ ] Nickname required
- [ ] Country required
- [ ] Must confirm 18+
- [ ] Must accept terms
- [ ] After onboarding, main app loads

## Market
- [ ] Whiskey list loads with 30 items
- [ ] Search works across name, brand, distillery, country, region
- [ ] Category filter works
- [ ] Price filter works
- [ ] Sort by name works
- [ ] Sort by price works
- [ ] Sort by age works
- [ ] Bottle detail shows all info
- [ ] Match % displays when available
- [ ] Request bottle form works

## Collection
- [ ] Add bottle to collection
- [ ] Set purchase price
- [ ] Set status (Closed/Opened/Finished)
- [ ] Edit collection item
- [ ] Remove from collection
- [ ] Summary shows correct stats
- [ ] Barrel level displays correctly
- [ ] Market value only shows for Closed bottles

## Tastings
- [ ] Add tasting with all 4 deltas
- [ ] Delta range -5 to +5 enforced
- [ ] Personal fit % calculated correctly
- [ ] Edit tasting
- [ ] Delete tasting
- [ ] Tasting history preserved

## Recommendations
- [ ] Locked message with < 3 tastings
- [ ] Unlock after 3 tastings
- [ ] Recommendations display
- [ ] Match % on bottle cards

## Admin
- [ ] Dashboard shows stats
- [ ] User list loads
- [ ] Activate/deactivate user
- [ ] Promote/demote user
- [ ] Whiskey list loads (all, including inactive)
- [ ] Create new whiskey
- [ ] Edit whiskey
- [ ] Deactivate whiskey
- [ ] Manage categories
- [ ] Review bottle requests
- [ ] Approve/reject requests
- [ ] Update market prices

## Profile
- [ ] Profile loads correctly
- [ ] Edit nickname and country
- [ ] Email is read-only
- [ ] Sign out works
- [ ] Account deletion (soft delete) works

## Edge Cases
- [ ] Inactive user cannot access app
- [ ] Same whiskey added twice creates two collection rows
- [ ] Multiple tastings for same bottle on different dates
- [ ] Barrel level computed from ALL bottles (including Opened/Finished)
