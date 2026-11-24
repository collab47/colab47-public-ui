# Collab47 Frontend (SvelteKit 2 + Svelte 5 + Tailwind CSS 4 + Nanostores)

Modern SvelteKit UI application for **Collab47**, styled with **Tailwind CSS 4.x** (`@tailwindcss/vite`), powered by **Nanostores** (`nanostores`) for reactive state management and a dedicated reusable **Component Library** (`src/lib/components/ui`, aliased as `$ui`), connected to the NestJS + Fastify backend (`/api/v1`).

## Pages

| Route | Description |
|---|---|
| `/` | Collab47 Landing / Home page (`Your Innovation. Your Identity.`, 5-persona *Who Is It For?* grid, *How It Works*, EN/HI toggle) |
| `/signup` (`/register`) | Minimal 4-field Registration Page (`name`, `email`, `password`, `confirmPassword`) with live strength meter & inline validation |
| `/login` | Sign-In Page (`email`, `password`, `rememberMe`) with DPDP soft-delete account restoration toast & safe `?next=` redirect |
| `/onboarding` | 4-Step Post-Login Onboarding Wizard (Persona & Occupations, Affiliation, Broad Domains & Interests, `@handle` & Avatar) |
| `/dashboard` | Role-based post-login dashboard (`student`, `researcher`, `faculty`, `industry`, `institution`, `mentor`) with colorful `StatCard` metrics, live `SearchBar`, Projects, Posts composer, and Opportunities |
| `/profile` | Authenticated 5-Section Progressive Profile Editor (Basic Info, Education, Experience, Expertise & Skills, About & Social Links) |
| `/u/[handle]` | Public Portfolio Page respecting `visibility` and `dob_privacy` |

## Reusable Component Library (`$ui` → `src/lib/components/ui/`)

`Alert`, `AuthShell` (modern responsive 50/50 split screen), `Avatar`, `Badge`, `Button`, `Card`, `Checkbox`, `ChipGroup`, `Divider`, `Footer`, `Input`, `Navbar`, `PasswordInput`, `ProgressBar`, `Select`, `SocialLoginButton` (Google OAuth via `@auth/sveltekit`), `Spinner`, `Tabs`, `Textarea`, `ToastContainer`, `Wordmark`.

## Google Social Login (`@auth/sveltekit`)

1. Create an OAuth 2.0 Client ID in Google Cloud Console with redirect URI:
   `http://localhost:5173/auth/callback/google`
2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `frontend/.env` (and optionally `GOOGLE_CLIENT_ID` in `backend/.env` for strict audience verification).
3. Run `npm install` in `frontend/` to install `@auth/sveltekit`.

## Nanostores (`src/lib/stores/`)

- `authState`, `isAuthenticated`, `currentUser` (`auth.store.ts`) — JWT session state persisted in `localStorage` with automatic token refresh in `src/lib/api/client.ts`
- `profileState` (`profile.store.ts`) — full 5-section profile & master dropdown catalog cache
- `toasts` (`toast.store.ts`) — app-wide toast notifications
- `locale` (`locale.store.ts`) — English / Hindi (`en` / `hi`) switcher

## Quick Start

```bash
cd frontend
npm install
npm run check
npm run dev
```

Open `http://localhost:5173` (ensure the NestJS + Fastify backend is running on `http://localhost:4000`).

## Vercel Deployment (`@sveltejs/adapter-vercel`)

This app is configured with `@sveltejs/adapter-vercel` in `svelte.config.js`.

1. In Vercel Project Settings, set **Root Directory** to `frontend` (Framework Preset: **SvelteKit**).
2. Add the following Environment Variables in Vercel:
   - `PUBLIC_API_BASE_URL` — your deployed NestJS backend URL (e.g. `https://api.yourdomain.com/api/v1`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_SECRET` (32+ char random secret)
   - `AUTH_TRUST_HOST=true`
3. Add `https://<your-app>.vercel.app/auth/callback/google` to Google Cloud Console OAuth redirect URIs and add `https://<your-app>.vercel.app` to `CORS_ORIGIN` in the backend `.env`.
