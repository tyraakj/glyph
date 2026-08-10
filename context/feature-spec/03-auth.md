Get Better Auth (with the Better Auth UI kit) installed and connected. Wire it into the Next.js app: provider, auth pages, redirects, route protection, and user menu.

## Design

Build the auth pages using standard HTML and Tailwind CSS, consuming the app's existing Tailwind CSS variables directly. Do not use shadcn or pre-built UI kits. Do not hardcode colors; components should pick up `--background`, `--foreground`, `--primary`, etc. from the app's existing theme.

Sign-in and sign-up pages:

- large screens: simple two-panel layout
- left: compact logo, tagline, short text-only feature list
- right: centered custom sign-in / sign-up form
- small screens: form only
- no gradients
- no oversized hero sections
- no feature cards
- no scroll-heavy layouts

Keep the layout minimal and professional.

## Implementation

Use Better Auth's standard client-side hooks (like `useSession`) directly in components.

Create `/sign-in` and `/sign-up` pages, each rendering a custom form (using standard HTML/Tailwind) inside the right panel described above.

Use `proxy.ts` at the project root, not `middleware.ts`.

Define public routes using the existing sign-in and sign-up env vars if the project already has them. Better Auth has no built-in equivalent to Clerk's public-route env-var convention, so this allowlist has to be declared explicitly (a small array of path prefixes) rather than inferred the way Clerk's was. Protect everything else by default: in `proxy.ts`, check only for the session cookie's existence via `getSessionCookie()` — Better Auth's own guidance is to avoid DB/API calls at the proxy layer. Do the full `auth.api.getSession()` check in the protected pages themselves.

Update `/`:

- authenticated users redirect to `/editor`
- unauthenticated users redirect to `/sign-in`

Add a custom user menu to the editor navbar right section for profile settings and logout.

Implement a minimal, custom user menu and account flow using standard HTML/Tailwind.

Use existing Better Auth env vars (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, plus the Prisma connection string from your existing adapter doc). Do not rename or invent new ones.

## Dependencies

install: `better-auth`.

Assumes the Prisma adapter/schema from your existing doc is already wired into `auth.ts` — this doc only covers the frontend and route-protection layer on top of it.

## Check When Done

- `proxy.ts` exists at the root
- all routes are protected except public auth paths
- auth pages use the app's existing CSS variables with no hardcoded colors
- auth components use standard HTML/Tailwind
- `npm run build` passes