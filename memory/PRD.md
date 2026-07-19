# NoMoreScamCalls Beta Portal

## Overview
Single React app serving two surfaces:
- **Landing / onboarding** at `/` (the pre-existing marketing + 4-step onboarding page — untouched)
- **Beta portal** at `/portal/*` (invitation code → registration → agreement → participant dashboard + admin console)

## Environment variables
- `REACT_APP_BACKEND_URL` — preview/deploy URL (already set)
- `REACT_APP_PORTAL_API_BASE_URL` — base URL for all portal API calls (currently `https://scamcop-api.smokey831831.workers.dev`)

The portal never hard-codes the API base URL. All fetches route through `src/lib/portalApi.js`.

## Auth
- Bearer token issued by `/portal/auth/register` and `/portal/auth/login`
- Token stored in `localStorage` under `nmsc_portal_token`
- Every authenticated request sends `Authorization: Bearer <token>`
- Auth layer centralized in `src/contexts/AuthContext.jsx` and `src/lib/portalApi.js`
- Two roles: `participant` and `admin` (or `administrator`)

## Routes
| Path | Purpose | Guards |
|---|---|---|
| `/` | Landing page (unchanged) | — |
| `/portal/join` | Enter invitation code | — |
| `/portal/register` | Create account | Requires code in nav state |
| `/portal/login` | Sign in | — |
| `/portal/agreement` | Read + accept Beta Participation Agreement | Auth |
| `/portal/dashboard` | Participant dashboard | Auth + Agreement |
| `/portal/feedback` | Report an issue | Auth + Agreement |
| `/portal/profile` | Edit profile | Auth + Agreement |
| `/portal/admin` | Admin overview | Auth + Agreement + Admin |
| `/portal/admin/participants` | Participants list | Admin |
| `/portal/admin/participants/:id` | Participant detail + call activity + admin actions | Admin |
| `/portal/admin/codes` | Invitation code management | Admin |
| `/portal/admin/feedback` | Review + update follow-up on submitted feedback | Admin |

## Portal API endpoints (centralized in `src/lib/portalApi.js`)
```
POST   /portal/invite-codes/validate                { code }
POST   /portal/auth/register                        { code, first_name, last_name, email, password, phone, carrier, contact_method }
POST   /portal/auth/login                           { email, password }
POST   /portal/auth/logout                          bearer
GET    /portal/me                                   bearer
PATCH  /portal/me                                   bearer
POST   /portal/agreement/accept                     bearer  { version }
GET    /portal/me/summary                           bearer
GET    /portal/me/calls?limit=                      bearer
POST   /portal/me/feedback                          bearer  { category, related_call_id, comments }
GET    /portal/admin/stats                          admin
GET    /portal/admin/participants?search=&status=   admin
GET    /portal/admin/participants/:id               admin
PATCH  /portal/admin/participants/:id               admin  { account_status, admin_notes }
GET    /portal/admin/participants/:id/calls         admin
GET    /portal/admin/invite-codes                   admin
POST   /portal/admin/invite-codes                   admin  → { code: "NMSC-XXXX-XXXX" }
PATCH  /portal/admin/invite-codes/:id               admin  { status: "closed" }
GET    /portal/admin/feedback                       admin
PATCH  /portal/admin/feedback/:id                   admin  { follow_up_status }
```
Endpoint paths are defined once in `ENDPOINTS` — adjust there if the backend contract differs.

## Beta Participation Agreement
- Content lives in `src/data/agreement.js`
- Current version: `beta-1.0`
- Ten sections from the user-provided spec (program purpose, beta nature, call-handling disclaimer, release of responsibility, privacy, confidentiality, appropriate conduct, no compensation, no ownership/investment rights, termination)
- Accepted version + timestamp recorded server-side via `POST /portal/agreement/accept`

## Support contact
`support@nomorescamcalls.com` — surfaced in every portal layout (participant, admin, and pre-auth) and on the agreement page.

## Deployment
Currently deployed via Emergent → production URL provided by user. Custom domain `beta.nomorescamcalls.com` mapped via CNAME through Entri.

## Backlog
- Wire real backend endpoints (backend team to build to the contract above).
- Add final agreement copy once approved (bump `AGREEMENT_VERSION`).
- Optional: email verification step after registration (backend-dependent).
