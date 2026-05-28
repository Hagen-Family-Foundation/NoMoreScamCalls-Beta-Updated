# NoMoreScamCalls.com - Beta Onboarding Landing Page

## Overview
Single-page beta onboarding landing page for NoMoreScamCalls.com where invited beta testers can join the private beta, enter their phone information, set up call forwarding to the assigned ScamStop/Telnyx number, and get ready for their first test call.

## Tech Stack
- React (CRA) + Tailwind CSS + Shadcn/UI
- Real API integration with Cloudflare Worker at `https://scamcop-api.smokey831831.workers.dev`

## Page Structure
1. **Header** - Sticky nav with brand name + Beta badge
2. **Hero Section** - Private Beta badge, headline, subheadline, CTA
3. **How it Works** - 3 step cards (Enter info → Set up forwarding → Ready for test call)
4. **Beta Onboarding Form** - 3-step flow with progress indicator (Info → Forward → Ready)
5. **Footer** - Brand + beta coordinator contact

## Corrected Flow (v2)
- **Step 1 (Info)**: Collect name, email, protected phone → POST to backend
- **Step 2 (Forward)**: Display assigned ScamStop/Telnyx number, forwarding instructions, "I have turned on call forwarding" button
- **Step 3 (Ready)**: Success - "Ready for first test call" with checklist

## Removed from v1
- Forwarding phone number field
- SMS verification code flow
- Footer scanning disclaimers (email/SMS/Skeeter)

## API Integration
- `POST /subscriber/onboarding` - Create beta account (name, email, protected_phone_number)
- All API config centralized in `/src/lib/api.js`
- Defensively extracts system_number from onboarding response

## Design System
- Primary: Calming teal (`187 65% 33%`)
- Background: Soft off-white (`210 25% 97%`)
- Foreground: Dark navy (`215 28% 17%`)
- Font: Work Sans
