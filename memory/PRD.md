# NoMoreScamCalls.com - Beta Onboarding Landing Page (Standalone)

## Overview
Single-page multi-step beta onboarding flow. States transition within one page — no separate routes.

## States
- **State 1**: Signup form (name, email, protected phone)
- **State 2A**: Assigned forwarding number received → display + copy
- **State 2B**: Number pending → waiting message with account summary
- **State 3**: Forwarding instructions + "I have turned on call forwarding" → calls setup-complete API
- **State 4A**: First test call pending
- **State 4B**: First test call started
- **State 4C**: Success — "Your phone is now protected"
- **State 4D**: Needs attention — retry + check status

## API Endpoints (all in `/src/lib/api.js`)
- `POST /subscriber/onboarding`
- `POST /subscriber/{id}/forwarding/setup-complete` (Bearer auth)
- `GET /subscriber/{id}/forwarding/status` (Bearer auth)
- `POST /subscriber/{id}/forwarding/first-test-call/retry` (Bearer auth)

## Progress Indicator
Info → Assigned number → Forwarding → Test call

## Not included
No Stripe, no forwarding phone input, no SMS verification, no ScamStop/Telnyx/Skeeter mentions, no inactive features.
