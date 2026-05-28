# NoMoreScamCalls.com - Beta Onboarding Landing Page

## Overview
Single-page beta onboarding landing page for NoMoreScamCalls.com. 4-step flow: sign up → receive assigned ScamStop number → turn on call forwarding → ready for test call.

## 4-Step Flow
1. **Info** — Collect name, email, protected phone → POST to backend
2. **Number** — Display assigned ScamStop/Telnyx forwarding number with copy button
3. **Forward** — Forwarding instructions + "I have turned on call forwarding" button
4. **Ready** — Success: "Ready for first test call" with 4-item checklist

## API Integration
- `POST /subscriber/onboarding` at `https://scamcop-api.smokey831831.workers.dev`
- Config centralized in `/src/lib/api.js`
- Defensively extracts system_number from onboarding response

## Design
- Primary: Teal (`187 65% 33%`), Background: Off-white, Text: Dark navy
- Font: Work Sans | Mobile-first responsive
