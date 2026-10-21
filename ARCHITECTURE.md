# PetMets Technical Architecture# PetMets Technical Architecture

App.petmets.in code

Code for **app.petmets.in**. This document describes the architecture, data model, design system, performance/SEO setup and core conventions of the PetMets app. It is written for both human developers and AI coding assistants — keep it up to date when you change structure, data shape or conventions.

This document provides a detailed overview of the technical architecture, data structures, and core logic of the PetMets application. It is intended for developers working on the codebase.

> Quick links: [1. Tech](#1-core-technologies) · [2. Structure](#2-project-structure) · [3. Frontend](#3-frontend-architecture) · [4. Design system](#4-design-system) · [5. Backend](#5-backend-firebase) · [6. Performance & caching](#6-performance--caching) · [7. SEO](#7-seo) · [8. AI](#8-generative-ai-genkit) · [9. Known limitations](#9-known-limitations--roadmap) · [10. Changelog](#10-changelog)

## 1. Core Technologies

---

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)

## 1. Core Technologies- **Language**: [TypeScript](https://www.typescriptlang.org/)

- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

| Area | Tech |- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)

|---|---|- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)

| Framework | Next.js 15 (App Router, Turbopack in dev) |- **Generative AI**: [Google AI & Genkit](httpss://firebase.google.com/docs/genkit)

| Language | TypeScript |- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

| Styling | Tailwind CSS + centralized design tokens (`src/theme/`) |

| UI primitives | ShadCN UI (`src/components/ui/`) |---

| Backend | Firebase — Auth (Email/Password + Google), Firestore, Storage |

| AI | Genkit + Google AI (Gemini) |## 2. Project Structure

| Forms | React Hook Form + Zod |

| Font | PT Sans (`next/font/google`, CSS var `--font-pt-sans`) |The project uses the standard Next.js App Router structure.



---```

.

## 2. Project Structure├── src

│   ├── app/                # Application routes. Each folder is a URL segment.

```│   │   ├── (main)/         # Main application layout group

.│   │   ├── login/          # Login/Signup page (standalone layout)

├── ARCHITECTURE.md            # This file│   │   └── layout.tsx      # Root layout

├── .github/copilot-instructions.md  # Short rules for AI agents│   ├── components/         # Reusable components

├── firestore.rules / storage.rules│   │   ├── features/       # Components with business logic (e.g., Smart Tagging Form)

├── next.config.ts             # Image formats/caching, package import optimization│   │   ├── layout/         # Layout components (Sidebar, etc.)

├── tailwind.config.ts         # Imports src/theme/tokens.ts│   │   └── ui/             # ShadCN UI components

└── src│   ├── contexts/           # React Context providers (Authentication, Loading)

    ├── app/                   # Routes (folder = URL segment)│   ├── hooks/              # Custom React hooks (useToast, useMobile)

    │   ├── layout.tsx         # Root layout + global SEO metadata + viewport│   ├── lib/                # Core libraries, utilities, and Firebase config

    │   ├── loading.tsx        # Fallback route skeleton│   ├── config/             # Site configuration (e.g., navigation items)

    │   ├── robots.ts / sitemap.ts / manifest.ts   # SEO + PWA files│   └── ai/                 # Genkit flows and AI-related code

    │   ├── page.tsx           # Home (visual reference design)│       ├── flows/          # Specific AI flows (e.g., smart-tagging)

    │   ├── <route>/page.tsx   # Page│       └── genkit.ts       # Genkit initialization and configuration

    │   ├── <route>/layout.tsx # Metadata-only layout (title/description)├── public/                 # Static assets (images, etc.)

    │   └── <route>/loading.tsx# Instant skeleton during navigation└── ...                     # Root configuration files

    ├── components/```

    │   ├── design/            # Design-system components (PageContainer, Surface, PromoCard, PageSkeleton…)

    │   ├── features/          # Business components (ServiceProviderListing, SmartTaggingForm)---

    │   ├── layout/            # AppLayout (auth guard), MainLayoutInternal (sidebar/header), BottomNav

    │   └── ui/                # ShadCN primitives (button, card, input… — restyled to tokens)## 3. Frontend Architecture

    ├── theme/

    │   ├── tokens.ts          # Raw design values (colors, type scale, radius, shadows)### Next.js App Router

    │   └── variants.ts        # Named style recipes (cva) built from tokens

    ├── config/- **Server-First by Default**: Most components are React Server Components (RSCs) for better performance and reduced client-side JavaScript.

    │   ├── nav.ts             # Sidebar / bottom-nav items- **Client Components**: Components requiring interactivity, state, or lifecycle hooks (e.g., forms, buttons with `onClick` handlers) use the `"use client";` directive.

    │   └── site.ts            # Site name, URL, description, public/private route lists- **Routing**: File-based routing is used. The folder structure inside `src/app` directly maps to URL paths. Dynamic routes are used for pages like individual chat sessions (`/chats/[chatId]`).

    ├── contexts/              # AuthContext (user + role), LoadingContext (blocking loader)

    ├── firebase/              # SDK init (+ persistent cache), hooks, error emitter, non-blocking writes### State Management

    ├── lib/

    │   ├── firebase.ts        # Exports app, auth, db, storage- **React Context**: For global state, we use React Context. This is lightweight and sufficient for our current needs.

    │   ├── seo.ts             # pageMetadata() helper + MetadataOnlyLayout  - `src/contexts/auth-context.tsx`: Manages the current user's authentication state (`user`, `isLoading`). It listens to Firebase Auth's `onAuthStateChanged` to provide the user object or `null` to the entire app.

    │   └── utils.ts           # cn() — tailwind-merge aware of custom tokens  - `src/contexts/loading-context.tsx`: Manages a global loading state, primarily used for page transition indicators.

    └── ai/                    # Genkit init + flows

```### UI & Styling



---- **ShadCN UI**: We leverage ShadCN for our component library. These are unstyled, accessible components that we can own and style using Tailwind CSS. The components are located in `src/components/ui`.

- **Tailwind CSS**: A utility-first CSS framework used for all styling. The theme (colors, fonts, etc.) is configured in `tailwind.config.ts` and `src/app/globals.css`.

## 3. Frontend Architecture

### Forms

### Rendering model (important)

- Almost every page is a **Client Component** (`"use client"`) that reads Firestore in the browser via `onSnapshot` / `getDocs`.- **React Hook Form**: Used for managing form state, submission, and validation.

- `src/components/layout/app-layout.tsx` is a **client-side auth guard**: it renders nothing until Firebase Auth resolves, redirects signed-out users to `/login`, and signed-in users away from `/login`.- **Zod**: Used to define validation schemas for our forms. These schemas are passed to React Hook Form's `zodResolver` for seamless integration.

- Consequence: pages cannot export `metadata` themselves, so each route has a small server `layout.tsx` that only exports metadata (see §7).

---

### State

- `src/contexts/auth-context.tsx` — `user`, `userRole` (`'owner' | 'provider'`, read from `users/{uid}.role`, default `owner`), `isLoading`, `userSignOut()`.## 4. Backend Architecture (Firebase)

- `src/contexts/loading-context.tsx` + `src/components/global-loader.tsx` — full-screen blocking overlay. **Only for blocking actions** (logout, saving). Do **not** call `showLoading()` on navigation (see §6).

Firebase provides our entire backend infrastructure. The configuration is centralized in `src/lib/firebase.ts`.

### Navigation & loading UX

- Sidebar/bottom-nav links navigate instantly (no global spinner).### Authentication

- Each route has a `loading.tsx` that renders `<PageSkeleton variant="grid" | "list" | "detail" />` immediately; the page then shows its own data skeletons until Firestore data arrives.

- We use Firebase Authentication with the **Email/Password** provider.

| Skeleton variant | Routes |- The `AuthProvider` (`src/contexts/auth-context.tsx`) wraps the application and uses `onAuthStateChanged` to monitor the user's login state.

|---|---|- The `AppLayout` (`src/components/layout/app-layout.tsx`) acts as a guard, redirecting users to `/login` if they are not authenticated and trying to access a protected route.

| `grid` | `/` (root fallback), providers, walkers, grooming, training, boarding, photography, playzone, adoption, match |

| `list` | chats, bookings, records |### Firestore Data Model

| `detail` | pet-profile, business-profile, profile/[userId], providers/[id], chats/[chatId] |

Our database is Firestore, a NoSQL document database. Here is the primary collection structure:

### Authentication flows (`src/app/login/page.tsx`)

- Email/password sign-up & sign-in.- **`users/{userId}`**: Stores public-facing information about a user.

- **Google Sign-In**: for a *new* Google user a role-picker dialog (Pet Owner / Service Provider) is shown **before** the `users/{uid}` (+ `pets/{uid}` for owners) documents are created. Cancelling signs the user out. A ref (`googleFlowActiveRef`) prevents the auth guard from redirecting mid-flow; on completion it does a full `window.location.assign("/")`.  - `name`: string

- **Logout**: button with confirmation `AlertDialog` on `/pet-profile` (also in sidebar footer).  - `email`: string

  - `avatar`: string (URL to image in Firebase Storage)

### Forms  - `phone`: string (optional)

React Hook Form + Zod (`zodResolver`) with ShadCN `<Form>` wrappers.  - `address`: string (optional)

  - `createdAt`: timestamp

### Shared feature components

- `src/components/features/service-provider-listing.tsx` — `<ServiceProviderListing>` powers walkers, grooming, training, boarding, photography. Props: `service` (Firestore `service` value, e.g. `"Walking"`), `title?`, `intro`, `cta {label, href, icon}`, `emptyText`, `imageHeight?`, `action? {label, icon?}` or `renderAction(provider)` for custom footers (walkers uses a contact dialog). Each service page is ~15 lines of config.- **`users/{userId}/pets/{petId}`**: A subcollection for a user's pets. We currently only support one pet per user, stored with the ID `"main-pet"`.

  - `name`: string

---  - `breed`: string

  - `age`: string

## 4. Design System  - `gender`: "Male" | "Female"

  - `bio`: string

**Goal:** any visual change should only require editing design files, never individual pages.  - `avatar`: string (URL to image in Firebase Storage)

**Reference design:** the home page `src/app/page.tsx`. Brand colors and PT Sans are fixed; no dark mode.

- **`matchRequests/{requestId}`**: Stores requests sent from one user to another.

### 4.1 Layers  - `requesterId`: string (UID of the user sending the request)

  - `targetOwnerId`: string (UID of the user receiving the request)

| Layer | File(s) | What lives there |  - `targetPetId`: string

|---|---|---|  - `status`: "pending" | "accepted" | "declined"

| 1. Tokens | `src/theme/tokens.ts` | Raw values: brand/service/status colors, type scale, radius, shadows. Wired into Tailwind. |  - `createdAt`: timestamp

| 1b. Core theme | `src/app/globals.css` | ShadCN CSS vars: `--primary #FF642F`, `--accent #274E4A`, `--background #F0F4F7`, `--radius`, etc. + body gradient wash. |

| 2. Variants | `src/theme/variants.ts` | Named class recipes (`cva`) built only from tokens. |- **`chats/{chatId}`**: Created when a match request is accepted. The `chatId` is a sorted, concatenated string of the two participants' UIDs (e.g., `uid1_uid2`).

| 3. Components | `src/components/design/*` | React components using the variants. Import from `@/components/design`. |  - `participants`: array of two user UIDs

| Primitives | `src/components/ui/*` | ShadCN components; `button`, `card`, `input` restyled to tokens. |  - `lastMessage`: string

  - `lastMessageTimestamp`: timestamp

### 4.2 Tokens → Tailwind classes (`tokens.ts`)

- **Colors**- **`chats/{chatId}/messages/{messageId}`**: Subcollection for messages within a chat.

  - `brand.*` → `bg-brand-forest`, `bg-brand-rose(-soft)`, `bg-brand-ink`, `bg-brand-cream`, `text-brand-amber`, `bg-brand-moss`  - `text`: string

  - `service.<key>` / `service.<key>-soft` → per-service icon/tile colors (match, walker, training, grooming, boarding, reports, playzone)  - `senderId`: string (UID of the message sender)

  - `status.<tone>` / `-soft` → success, positive, info, warning, pending, danger  - `timestamp`: timestamp

  - `surface.subtle` → `bg-surface-subtle` (inset rows/inputs)

  - `rating` → `fill-rating text-rating` (stars)### Firebase Storage

- **Font sizes** (minimum 10px for a premium feel): `text-micro` 10, `text-overline` 10 (tracked), `text-caption` 11, `text-label` 12.5, `text-label-lg` 13.5.

- **Radius**: `rounded-card` (1.125rem / 18px), `rounded-pill`.- We use Firebase Cloud Storage to store user-uploaded media.

- **Shadows**: `shadow-card` (layered, soft), `shadow-card-hover` (lift), `shadow-glow` (primary CTA glow).- **Path Structure**:

  - Owner Avatars: `users/{userId}/owner/avatar.jpg`

### 4.3 Variants (`variants.ts`)  - Pet Avatars: `users/{userId}/pets/main-pet/avatar.jpg`

- `text.*` — `pageTitle`, `pageSubtitle`, `sectionTitle`, `overline`, `itemTitle`, `itemMeta`, `link`, `linkSm`, `promoTitle`, `promoBody`, `fieldLabel`, `fieldError`, `value`, `cardTitle`.  - Pet Documents: `users/{userId}/documents/{documentId}` (not yet fully implemented)

- `layout.*` — `page`, `pageNarrow`, `section`, **`cardGrid`** (2 → 3 → 4 → 5 columns; used by match + providers + skeletons).

- `surfaceVariants({ variant, padding })` — `card` | `interactive` (hover lift) | `inset` | `empty`; padding `none|sm|md|lg`.---

- `promoVariants({ tone })` — `forest` | `rose` | `ink` | `accent` | `cream`.

- `pillButtonVariants({ tone, size })` — tones `primary|light|rose`, sizes `xs|sm|md|lg`.## 5. Generative AI (Genkit)

- `chipVariants({ tone })`, `bookingStatusTone`, `buttonTone.dark` / `buttonTone.positive` (e.g. Accept buttons), `imageOverlayPill`, `softInput`, `featureBadgeVariants`, `serviceStyles[ServiceKey]`.

We use Genkit, Google's open-source framework for building AI-powered features.

### 4.4 Components (`src/components/design/`)

`PageContainer` (`narrow`), `PageHeader`, `SectionHeader`, `OverlineHeader`, `Surface`, `Chip`, `PillButton`, `InfoRow`, `EmptyState`, `FeatureBadge`, `PromoCard`, `ServiceTile`, `PageSkeleton`.- **Configuration**: `src/ai/genkit.ts` initializes Genkit and the Google AI plugin. It checks for the `GOOGLE_API_KEY` environment variable to enable or disable AI features gracefully.

- **Smart Tagging Flow**: The primary AI feature is "Smart Tagging" for pet documents, defined in `src/ai/flows/smart-tagging.ts`.

### 4.5 Rules  - It defines a Genkit `flow` that takes a document description as input.

- In pages: **no** hex colors, `slate-*`/`gray-*`/`green-600`-style palette classes, `text-[Npx]`, `rounded-[…]`, or `shadow-md/lg/xl`. Use tokens/variants/components. Add a new token/variant instead of a one-off class.  - It uses a `prompt` with a Zod schema for structured output, asking the Gemini model to return an array of relevant tags.

- Exceptions: official third-party brand colors (Google logo SVG in login).  - The flow is exposed to the frontend via a React Server Action (`src/app/records/actions.ts`). This ensures the `GOOGLE_API_KEY` is never exposed to the client.
- `cn()` (`src/lib/utils.ts`) uses `extendTailwindMerge` registered with the custom `fontSize`, `borderRadius`, `boxShadow` keys — without this, `cn("text-caption", "text-primary")` would drop the size class.
- **`tailwind.config.ts` `content` must include `./src/theme/**`** — otherwise classes that only appear in `variants.ts` (e.g. `bg-brand-forest`) are purged and promo cards render without backgrounds.

### 4.6 Leftover-style check
```powershell
Get-ChildItem src -Recurse -Include *.tsx | Where-Object { $_.FullName -notmatch "\\components\\ui\\" } |
  Select-String -Pattern "#[0-9A-Fa-f]{6}|slate-|gray-|text-\[\d+px\]|(green|blue|orange|yellow|red)-\d|bg-white|rounded-\[|shadow-(md|lg|xl|2xl)\b"
```
(Matches on `translate-y-…` / `drop-shadow-…` are false positives.)

---

## 5. Backend (Firebase)

### 5.1 Initialization
- `src/firebase/index.ts`
  - `initializeFirebase()` — **DO NOT MODIFY.** Calls `initializeApp()` with no args first (Firebase App Hosting injects config), falls back to `firebaseConfig`.
  - `getSdks()` — returns `{ firebaseApp, auth, firestore }`. Firestore is created via `getFirestoreWithCache()` (persistent IndexedDB cache — see §6).
- `src/lib/firebase.ts` — re-exports `app`, `auth`, `db`, `storage` for use in pages.

### 5.2 Firestore data model (as used by the code)

| Path | Purpose / key fields |
|---|---|
| `users/{uid}` | `name`, `email`, `avatar`, `phone?`, `address?`, **`role`** (`'owner'` \| `'provider'`), `createdAt` |
| `pets/{ownerUid}` | **One pet per user, doc ID = owner UID** (top-level collection). `name`, `breed`, `age`, `gender`, `bio`, `avatar`, `dataAiHint?` |
| `service_providers/{id}` | `name`, `service` (`Walking` \| `Grooming` \| `Training` \| `Boarding` \| `Photography` \| `Playzone`), `bio`, `location`, `image`, `rating`, `email?`, `phone?`, `createdAt` |
| `bookings/{id}` | Service bookings for a user (status, time, provider info) |
| `adoptionListings/{id}` | Pets listed for adoption: `name`, `breed`, `age`, `city`, `bio`, `image`, `ownerId`, `createdAt` |
| `matchRequests/{id}` | `requesterId`, `requesterEmail`, `targetOwnerId`, `targetPetId`, `targetPetName`, `status` (`pending`\|`accepted`\|`declined`), `createdAt` |
| `chats/{chatId}` | `chatId` = sorted UIDs joined by `_`. `participants[]`, `participantEmails[]`, `lastMessage`, `lastMessageTimestamp`, `createdAt` |
| `chats/{chatId}/messages/{id}` | `text`, `senderId`, `timestamp` |

> ⚠️ Older docs referenced `users/{uid}/pets/main-pet`. The code uses **`pets/{uid}`**.

### 5.3 Storage paths
- Owner avatar: `users/{uid}/owner/avatar.jpg`
- Pet avatar: `users/{uid}/pets/main-pet/avatar.jpg`
- Documents: `users/{uid}/documents/{docId}` (not fully implemented)

Update `firestore.rules` / `storage.rules` when adding collections or paths.

### 5.4 Error handling convention
- Write helpers in `src/firebase/non-blocking-updates.tsx` are fire-and-forget.
- On permission failure, code emits `errorEmitter.emit('permission-error', new FirestorePermissionError({ path, operation, requestResourceData }))`.
- `src/components/FirebaseErrorListener.tsx` (mounted globally) **throws** the error so the Next.js overlay shows the security-rule context. Don't replace this with try/catch + toast.

---

## 6. Performance & Caching

| Mechanism | Where | Effect |
|---|---|---|
| **Firestore persistent cache** | `src/firebase/index.ts` → `getFirestoreWithCache()` using `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })` | Data persists in IndexedDB across reloads/tabs → instant repeat renders, `onSnapshot` only syncs deltas (fewer billed reads), offline support. Falls back to `getFirestore()` on the server or if already initialized (HMR). |
| **Paginated match feed** | `src/app/match/page.tsx` | `pets` read with `orderBy(documentId()), limit(PETS_PAGE_SIZE=20), startAfter(cursor)`; "Load more pets" button. Cursor stored in a `useRef` (not state) so `fetchPets` always reads the latest value. No composite index needed. |
| **Image optimization** | `next.config.ts` | `formats: ['image/avif','image/webp']`, `minimumCacheTTL` 7 days. Every `fill` image should have a `sizes` prop (home, promo cards, listings do). |
| **Package import optimization** | `next.config.ts` → `experimental.optimizePackageImports` | Tree-shakes `lucide-react`, `date-fns`, `recharts`. |
| **Instant navigation** | `loading.tsx` per route + no `showLoading()` on nav | Route skeleton appears immediately; data skeletons follow. |
| Misc | `next.config.ts` | `poweredByHeader: false`, `compress: true`. |

Remote image hosts allowed: `placehold.co`, `firebasestorage.googleapis.com`, `picsum.photos`.

**Dev note:** on corporate networks `/_next/image` may fail with `SELF_SIGNED_CERT_IN_CHAIN` (proxy, not code). Fix with `NODE_EXTRA_CA_CERTS=<corp-ca.pem>` or `images.unoptimized` in dev only.

---

## 7. SEO

- **`src/config/site.ts`** — `SITE` (`name`, `tagline`, `description`, `url` from `NEXT_PUBLIC_SITE_URL`, default `http://localhost:3000`), `PUBLIC_ROUTES`, `PRIVATE_ROUTES`.
- **Root `src/app/layout.tsx`** — `metadataBase`, title template `"%s | PetMets"`, description, keywords, canonical, icons, Open Graph + Twitter card (`/images/banner.jpeg`), `locale: en_IN`; `viewport.themeColor = #FF642F`. `<head>`/`<body>` have `suppressHydrationWarning` to ignore attributes injected by browser extensions (e.g. LocatorJS).
- **Per-route metadata** — each route folder has `layout.tsx`:
  ```ts
  import { pageMetadata, MetadataOnlyLayout } from '@/lib/seo';
  export const metadata = pageMetadata('Pet Grooming', '…', '/grooming');          // public
  export const metadata = pageMetadata('Messages', '…', '/chats', { private: true }); // noindex
  export default MetadataOnlyLayout;
  ```
- **`robots.ts`** — allows `/`, disallows `PRIVATE_ROUTES`, links sitemap.
- **`sitemap.ts`** — generated from `PUBLIC_ROUTES`.
- **`manifest.ts`** — PWA manifest (installable, theme color).
- Image `alt` texts are descriptive (no "Promo 1").

**Production:** set `NEXT_PUBLIC_SITE_URL=https://app.petmets.in` in `apphosting.yaml` / env.

> Note: because of the client-side auth guard, crawlers currently see only the login redirect. Public pages become indexable only after the "public pages" roadmap item (§9).

---

## 8. Generative AI (Genkit)

- `src/ai/genkit.ts` initializes Genkit + Google AI; disables itself if `GOOGLE_API_KEY` is missing.
- `src/ai/flows/smart-tagging.ts` — Zod-structured Gemini output (tags for pet documents).
- Invoked **only** via Server Action `src/app/records/actions.ts` (key stays server-side). UI: `src/components/features/smart-tagging-form.tsx`.
- `npm run genkit:dev` runs the Genkit dev UI against `src/ai/dev.ts`.
- ⚠️ Known pre-existing type error: `src/ai/genkit.ts(4,14): Module "genkit" has no exported member 'Plugin'` (unrelated to app code; `ignoreBuildErrors` is on).

---

## 9. Known Limitations & Roadmap

| Item | Status / plan |
|---|---|
| **Public pages without login** | Postponed (big change). Make `/`, `/providers`, service pages, `/adoption`, `/match`, `/playzone` viewable signed-out; gate only actions (book/chat/request). Needs auth-optional layout + Firestore rule changes. Prerequisite for real SEO and server rendering. |
| **Server-side data fetching** | After the above: fetch public lists in Server Components with Firebase Admin + `revalidate` caching. |
| Match search | Filters only already-loaded pets. Full search needs a lowercase search field or Algolia/Typesense. |
| Match page size | Own pet + already-matched owners are filtered client-side, so a page can show < 20. |
| `ignoreBuildErrors` / `ignoreDuringBuilds` | Enabled in `next.config.ts`; run `npm run typecheck` manually. |

---

## 10. Changelog

Most recent first. Summarizes the refactor sessions so future contributors (and AI agents) understand *why* things look the way they do.

### Caching & pagination
- Firestore persistent IndexedDB cache (`getFirestoreWithCache` in `src/firebase/index.ts`).
- Match page paginated (20 per page + "Load more"), cursor in `useRef`.

### Instant navigation
- Removed `showLoading()` from sidebar/bottom-nav/provider/chat/adoption navigation.
- Added `PageSkeleton` (`grid|list|detail`) and `loading.tsx` for every route + root fallback.

### SEO & performance
- Added `src/config/site.ts`, `src/lib/seo.ts`, `robots.ts`, `sitemap.ts`, `manifest.ts`, per-route metadata layouts, root metadata/viewport.
- `next.config.ts`: AVIF/WebP, image cache TTL, `optimizePackageImports`, `poweredByHeader: false`.
- Added `sizes` to `fill` images; descriptive alt texts; font variable applied on `<html>`.
- Hydration warnings from browser extensions suppressed on `<head>`/`<body>`.

### Layout density
- Match & providers grids: 2/3/4/5 columns via `layout.cardGrid`; compact cards (4:3 image, `p-3`, small title/button).

### Premium polish (design files only)
- Type scale raised (min 10px), `rounded-card` 18px, layered `shadow-card`/`shadow-card-hover`, new `shadow-glow`.
- Cards get subtle border; `interactive` surfaces lift on hover.
- ShadCN `button` (rounded-xl, semibold, press scale, primary glow, orange-tinted outline/ghost hover), `card`, `input` (rounded-xl, soft focus ring) restyled.
- Body background: subtle brand-tinted radial gradients.
- **Fix:** added `./src/theme/**` to Tailwind `content` (promo card backgrounds were being purged).

### Design-system migration (all pages)
- Created tokens → variants → components layers.
- Migrated home, pet-profile, bookings, providers, providers/[id], service pages, playzone, adoption, match, chats, records, login, business-profile, coming-soon, profile/[userId], sidebar/header, bottom-nav, smart-tagging form.
- Extracted `ServiceProviderListing`; 5 service pages reduced to config.
- `cn()` taught about custom tokens via `extendTailwindMerge`.

### Auth features
- Google Sign-In with owner/provider role picker for new users.
- Logout with confirmation on profile page.
