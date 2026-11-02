# SYLUX FM — Request & Dedication

A separate Next.js app for the community event. The existing sylux-website root app is untouched.

## Features

- Discord OAuth sign-in using Supabase Auth, with a maximum of **two non-rejected requests per authenticated user**, enforced by a PostgreSQL trigger.
- Request form: artist, song, recipient (optional), dedication (max 500 characters).
- Staff moderation: Pending → Approved / Rejected.
- FIFO queue: Display Next selects the earliest Approved request only.
- Minimal dark OBS overlay; 12-second fade-out popup, with a private view key.
- Manual audio playback by host / music operator. No payment or donation service.

## Setup for Codex, local development, and Vercel

1. Open this repository in Codex and work inside apps/sylux-fm (do not use repository root as the app).
2. Create a Supabase project. In SQL Editor, run supabase/schema.sql.
3. At Discord Developer Portal, create an OAuth application. In Supabase Authentication > Providers > Discord, configure client ID and secret, and set Discord's redirect URL to Supabase's provider callback (shown in Supabase).
4. In Supabase Authentication > URL Configuration set Site URL to your deployed or local URL; add http://localhost:3000/auth/callback and https://YOUR-VERCEL-DOMAIN/auth/callback to redirect allow list.
5. Copy .env.example to .env.local and fill in values from Supabase Settings > API. OVERLAY_VIEW_KEY must be random and at least 32 characters. Keep SUPABASE_SERVICE_ROLE_KEY server-only; never commit .env.local.
6. cd apps/sylux-fm && npm install && npm run dev. Visit http://localhost:3000/request.
7. Sign in once using Discord, then find your auth user UUID in Supabase Authentication > Users. Insert it into radio_operators as described in schema.sql.
8. Visit /admin to approve requests, then Display Next. OBS Browser Source should point at /overlay?key=YOUR_OVERLAY_VIEW_KEY, with width 1920, height 1080 and transparent background.
9. In Vercel, import the GitHub repository, set **Root Directory** to apps/sylux-fm and configure the four environment variables. Deploy.

## Security and limitations

- Supabase login confirms Discord account ownership but does not verify membership in a specific Discord server. Add guild membership checks if access must be restricted to a server.
- Supabase RLS restricts members to their own request rows. Admin rights require an explicit radio_operators entry.
- The count limit is enforced in the database inside an advisory lock, so concurrent submissions cannot exceed two.
- Rejecting a request frees one slot; Completed requests still count toward the event's two-request lifetime limit.
- Never share the overlay key publicly. Rotate it if leaked. The overlay API exposes only the current on-air dedication.
- This is a reviewable MVP, not a deployed production service. Run build and manual end-to-end tests in Codex before deployment.
- Audio licensing, Discord streaming limitations, and moderation of member-provided text remain the event organizer's responsibility.
