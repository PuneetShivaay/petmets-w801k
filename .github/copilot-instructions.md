# PetMets — AI Agent Instructions

PetMets is a Next.js (App Router) pet-services app backed entirely by Firebase (Auth, Firestore, Storage), with Genkit/Google AI for "Smart Tagging". Read `ARCHITECTURE.md` first for the full data model — this file covers workflows and conventions not obvious from file inspection.

## Architecture essentials
- **App Router structure**: `src/app/<route>/page.tsx` maps directly to URLs. Dynamic routes exist for `chats/[chatId]`, `profile/[userId]`, `providers/[id]`.
- **Server-first**: Components are Server Components by default. Add `"use client";` only when using hooks/state/handlers (forms, interactive UI).
- **Firebase is the entire backend** — no custom API routes. All data access goes through `src/firebase/` and `src/lib/firebase.ts`.
- **Auth guard pattern**: `src/components/layout/app-layout.tsx` wraps protected routes and redirects to `/login` if `AuthContext` (`src/contexts/auth-context.tsx`) has no user. Login/signup pages intentionally render outside this layout.
- **Firestore structure** (see `ARCHITECTURE.md` §4 for full schema): `users/{userId}`, `users/{userId}/pets/main-pet` (single pet per user, fixed ID), `matchRequests/{requestId}`, `chats/{chatId}` where `chatId` = sorted concatenated UIDs (`uid1_uid2`), with `chats/{chatId}/messages/{messageId}` subcollection.
- **AI flows live in `src/ai/`**: Genkit is initialized in `src/ai/genkit.ts` and gracefully disables itself if `GOOGLE_API_KEY` is unset — check this guard before assuming AI features are active. Flows (e.g. `src/ai/flows/smart-tagging.ts`) use Zod schemas for structured Gemini output and are only invoked from the server via Next.js Server Actions (e.g. `src/app/records/actions.ts`), never called directly from client components, to keep the API key server-side.

## Firebase access patterns (non-obvious conventions)
- `src/firebase/provider.tsx` / `client-provider.tsx` set up React context for Firebase SDK instances — use the provided hooks instead of re-initializing `getAuth()`/`getFirestore()` elsewhere.
- `src/firebase/firestore/use-collection.tsx` and `use-doc.tsx` are custom hooks wrapping `onSnapshot` for real-time reads — prefer these over manual `onSnapshot` calls in components.
- `src/firebase/non-blocking-updates.tsx` and `non-blocking-login.tsx` contain **fire-and-forget write helpers** (`setDocumentNonBlocking`, `addDocumentNonBlocking`, `updateDocumentNonBlocking`, `deleteDocumentNonBlocking` — don't `await` Firestore writes in the UI thread). On failure, they `errorEmitter.emit('permission-error', new FirestorePermissionError({ path, operation, requestResourceData }))` (`src/firebase/error-emitter.ts` / `errors.ts`), building an object that mirrors the Firestore security-rule `request` (`auth`, `method`, `path`, `resource.data`). `src/components/FirebaseErrorListener.tsx` is mounted globally, listens for this event, and **throws** the error so Next.js's error boundary/overlay shows the exact rule-denial context — don't inline try/catch + toast for permission failures; follow this emit-and-throw pattern instead.
- `src/firebase/index.ts`'s `initializeFirebase()` is marked "DO NOT MODIFY" — it must call `initializeApp()` with zero args first (required for Firebase App Hosting to inject env config in production) and only falls back to the local `firebaseConfig` object on failure.
- Firestore/Storage security rules are in `firestore.rules` and `storage.rules` at repo root — update these when adding new collections or storage paths (e.g. `users/{userId}/pets/main-pet/avatar.jpg`, `users/{userId}/owner/avatar.jpg`).

## UI conventions
- UI primitives are ShadCN components in `src/components/ui/` — don't hand-roll buttons/dialogs/inputs; extend existing ShadCN components and Tailwind classes.
- Forms always use **React Hook Form + Zod** via `zodResolver` (see any form in `src/components/features/` for the pattern: schema → `useForm` → `<Form>` wrapper from `src/components/ui/form.tsx`).
- Global loading state (page transitions) goes through `src/contexts/loading-context.tsx` + `src/components/global-loader.tsx`, not local spinners.
- Nav items are centralized in `src/config/nav.ts` — add new routes there to appear in `bottom-nav.tsx`/sidebar.

## Developer workflows
- `npm run dev` — Next.js dev server with Turbopack.
- `npm run genkit:dev` / `genkit:watch` — runs the Genkit dev UI against `src/ai/dev.ts` for testing AI flows in isolation (separate from `next dev`).
- `npm run typecheck` — `tsc --noEmit`; run after larger refactors since there's no separate test suite configured.
- `npm run build` / `npm run start` — production build/serve.
- No unit/integration test runner is configured in this repo — validate changes via `typecheck`, `lint`, and manual flows through `npm run dev`.

## When adding features
1. Check `ARCHITECTURE.md` for whether the Firestore shape already supports it before inventing new fields/collections.
2. New protected pages go under `src/app/` and rely on `AppLayout` for auth — don't duplicate redirect logic.
3. New AI capabilities: add a flow under `src/ai/flows/`, export via `src/ai/dev.ts`, and call only from a Server Action.
