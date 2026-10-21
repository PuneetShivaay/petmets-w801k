# PetMets - Your All-in-One Pet Companion App
This code is related to app.petmets.in
PetMets is a modern, comprehensive web application designed to connect pet owners with a wide range of pet-related services and with each other. From finding the perfect playdate companion to managing your pet's health records, PetMets aims to be the ultimate digital assistant for every pet owner.

This project is built with a modern, scalable, and AI-powered tech stack, leveraging the best of Next.js for the frontend and Firebase for the backend.

## Core Features

- **Match Your Pet**: A unique social feature allowing users to find and connect with other pets for playdates, photoshoots, and more.
- **Dynamic Dashboard**: A personalized hub that provides users with an at-a-glance overview of pending match requests, upcoming appointments, and prompts to complete their profile.
- **Comprehensive Pet Profiles**: Users can create and manage detailed profiles for their pets, including photos, breed, age, gender, and bio.
- **Service Discovery**: Browse and connect with a variety of professional pet service providers:
  - **Pet Walkers**: Find trusted and verified walkers.
  - **Pet Groomers**: Discover expert groomers to pamper your pet.
  - **Pet Trainers**: Connect with certified trainers for obedience and skill-building.
  - **Pet Boarding**: Find safe and cozy boarding facilities.
- **Digital Pet Records**: Securely upload and organize important documents like vaccination records, vet bills, and health summaries.
- **AI-Powered Smart Tagging**: Leveraging Google's Gemini models via Genkit, the app automatically suggests relevant tags for uploaded documents, making organization effortless.
- **Real-time Chat**: Once a match is accepted, users can communicate through a built-in real-time chat feature.
- **Booking Management**: Schedule and manage appointments for various pet services directly within the app.

## Tech Stack & Architecture

PetMets is built using a modern, server-centric architecture with the Next.js App Router.

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/) - A collection of beautifully designed, accessible, and reusable components.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- **Backend & Database**: [Firebase](https://firebase.google.com/)
  - **Authentication**: Email/password and Google Sign-In (new Google users choose Pet Owner or Service Provider).
  - **Firestore**: A NoSQL database for storing all application data (user profiles, pet data, chats, etc.).
  - **Storage**: Cloud storage for user-uploaded files like pet avatars and documents.
- **Generative AI**: [Google AI & Genkit](https://firebase.google.com/docs/genkit) - Used for the "Smart Tagging" feature to analyze document descriptions and suggest relevant tags.
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for robust form validation.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

1. **Install Dependencies**:
   ```sh
   npm install
   ```

2. **Set Up Environment Variables**:
   Create a `.env` file in the root of the project and add your Firebase and Google AI API keys. You can get these from your Firebase project settings and Google AI Studio.

   ```env
   # Firebase Configuration (replace with your project's keys)
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...

   # Google AI API Key for Genkit
   GOOGLE_API_KEY=AIza...
   ```

3. **Run the Development Server**:
   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows the standard Next.js App Router structure. **For full technical details (data model, design system, caching, SEO, conventions, changelog) see [`ARCHITECTURE.md`](./ARCHITECTURE.md).** AI coding assistants should also read [`.github/copilot-instructions.md`](./.github/copilot-instructions.md).

```
.
├── src
│   ├── app/                # Routes: page.tsx + loading.tsx (skeleton) + layout.tsx (SEO metadata)
│   ├── components/
│   │   ├── design/         # Design-system components (PageContainer, Surface, PromoCard, PageSkeleton…)
│   │   ├── features/       # Business components (ServiceProviderListing, SmartTaggingForm)
│   │   ├── layout/         # Auth guard, sidebar/header, bottom nav
│   │   └── ui/             # ShadCN primitives
│   ├── theme/              # tokens.ts (raw design values) + variants.ts (style recipes)
│   ├── config/             # nav.ts (menu) + site.ts (SEO / route lists)
│   ├── contexts/           # Auth (user + role), Loading
│   ├── firebase/           # SDK init (persistent cache), hooks, error handling
│   ├── hooks/              # useToast, useMobile
│   ├── lib/                # firebase.ts, seo.ts, utils.ts (cn)
│   └── ai/                 # Genkit flows
├── public/                 # Static assets
└── ...                     # Config files (tailwind, next.js, firebase rules)
```

## Design & Styling

All visual styling is centralized — to restyle the app, edit only:

| File | Controls |
|---|---|
| `src/theme/tokens.ts` | Colors, font sizes, corner radius, shadows |
| `src/theme/variants.ts` | Reusable style recipes (cards, buttons, chips, grids, text styles) |
| `src/app/globals.css` | Core theme colors (primary orange, accent teal, background) |
| `src/components/design/*` | Shared layout/card components |

Pages should not contain hardcoded colors or pixel sizes. See `ARCHITECTURE.md` §4.

## Performance & SEO Highlights

- Firestore **persistent offline cache** (instant repeat visits, fewer reads).
- **Instant navigation** with per-route skeleton screens (`loading.tsx`).
- **Paginated** match feed ("Load more pets").
- AVIF/WebP images with long cache, `sizes` on all responsive images.
- Per-page titles/descriptions, Open Graph/Twitter cards, `robots.txt`, `sitemap.xml`, PWA manifest.

### Production environment
```env
NEXT_PUBLIC_SITE_URL=https://app.petmets.in   # used for canonical URLs, sitemap, social previews
```

## Useful Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run typecheck` | TypeScript check (builds ignore type errors — always run this) |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run genkit:dev` | Genkit AI dev UI |
