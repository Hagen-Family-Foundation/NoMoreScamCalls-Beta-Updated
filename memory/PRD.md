# NoMoreScamCalls.com - Beta Onboarding Landing Page

## Overview
Single-page beta onboarding landing page for NoMoreScamCalls.com where invited beta testers can join the private beta, enter their phone information, verify their forwarding number, and see a "protection active" status.

## Tech Stack
- React (CRA) + Tailwind CSS + Shadcn/UI
- Real API integration with Cloudflare Worker at `https://scamcop-api.smokey831831.workers.dev`

## Page Structure
1. **Header** - Sticky nav with brand name + Beta badge
2. **Hero Section** - Private Beta badge, headline, subheadline, CTA
3. **How it Works** - 3 step cards (Enter info → Verify → Start testing)
4. **Beta Onboarding Form** - Multi-step form with progress indicator
5. **Trust Footer** - Privacy disclaimers, inactive features note

## API Integration
- `POST /subscriber/onboarding` - Create beta account
- `POST /subscriber/{id}/forwarding/verify/start` - Send verification code
- `POST /subscriber/{id}/forwarding/verify/confirm` - Confirm code
- All API config centralized in `/src/lib/api.js`
- Bearer token auth for private endpoints
- In-memory state (no localStorage)

## Design System
- Primary: Calming teal (`187 65% 33%`)
- Background: Soft off-white (`210 25% 97%`)
- Foreground: Dark navy (`215 28% 17%`)
- Font: Work Sans
