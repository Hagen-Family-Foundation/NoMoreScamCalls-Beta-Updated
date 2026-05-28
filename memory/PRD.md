# NoMoreScamCalls.com - Beta Onboarding Landing Page (Standalone)

## Overview
Single-page beta onboarding landing page. 4-step flow: sign up → receive assigned ScamStop number → turn on carrier forwarding → ready for first test call.

## 4-Step Flow
1. **Info** — Name, email, protected phone → `POST /subscriber/onboarding`
2. **Number** — Display assigned `telnyx_system_number` with copy button + explanation
3. **Forward** — General carrier forwarding instructions → "I have turned on call forwarding" → `POST /subscriber/{id}/forwarding/setup-complete` (Bearer token)
4. **Ready** — Dynamic success based on backend response (auto/pending_manual/failed) + "Check setup status" via `GET /subscriber/{id}/forwarding/status`

## API Endpoints (all in `/src/lib/api.js`)
- `POST /subscriber/onboarding`
- `POST /subscriber/{id}/forwarding/setup-complete` (Bearer auth)
- `GET /subscriber/{id}/forwarding/status` (Bearer auth)

## Not included (per spec)
No Stripe, no forwarding phone input, no SMS verification, no email/SMS/Skeeter features, no fake testimonials.

## Design: Teal + navy + off-white, Work Sans font, mobile-first.
