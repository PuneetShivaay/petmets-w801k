# PetMets Technical Architecture
App.petmets.in code

This document provides a detailed overview of the technical architecture, data structures, and core logic of the PetMets application. It is intended for developers working on the codebase.

## 1. Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **Generative AI**: [Google AI & Genkit](httpss://firebase.google.com/docs/genkit)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 2. Project Structure

The project uses the standard Next.js App Router structure.

```
.
├── src
│   ├── app/                # Application routes. Each folder is a URL segment.
│   │   ├── (main)/         # Main application layout group
│   │   ├── login/          # Login/Signup page (standalone layout)
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable components
│   │   ├── features/       # Components with business logic (e.g., Smart Tagging Form)
│   │   ├── layout/         # Layout components (Sidebar, etc.)
│   │   └── ui/             # ShadCN UI components
│   ├── contexts/           # React Context providers (Authentication, Loading)
│   ├── hooks/              # Custom React hooks (useToast, useMobile)
│   ├── lib/                # Core libraries, utilities, and Firebase config
│   ├── config/             # Site configuration (e.g., navigation items)
│   └── ai/                 # Genkit flows and AI-related code
│       ├── flows/          # Specific AI flows (e.g., smart-tagging)
│       └── genkit.ts       # Genkit initialization and configuration
├── public/                 # Static assets (images, etc.)
└── ...                     # Root configuration files
```

---

## 3. Frontend Architecture

### Next.js App Router

- **Server-First by Default**: Most components are React Server Components (RSCs) for better performance and reduced client-side JavaScript.
- **Client Components**: Components requiring interactivity, state, or lifecycle hooks (e.g., forms, buttons with `onClick` handlers) use the `"use client";` directive.
- **Routing**: File-based routing is used. The folder structure inside `src/app` directly maps to URL paths. Dynamic routes are used for pages like individual chat sessions (`/chats/[chatId]`).

### State Management

- **React Context**: For global state, we use React Context. This is lightweight and sufficient for our current needs.
  - `src/contexts/auth-context.tsx`: Manages the current user's authentication state (`user`, `isLoading`). It listens to Firebase Auth's `onAuthStateChanged` to provide the user object or `null` to the entire app.
  - `src/contexts/loading-context.tsx`: Manages a global loading state, primarily used for page transition indicators.

### UI & Styling

- **ShadCN UI**: We leverage ShadCN for our component library. These are unstyled, accessible components that we can own and style using Tailwind CSS. The components are located in `src/components/ui`.
- **Tailwind CSS**: A utility-first CSS framework used for all styling. The theme (colors, fonts, etc.) is configured in `tailwind.config.ts` and `src/app/globals.css`.

### Forms

- **React Hook Form**: Used for managing form state, submission, and validation.
- **Zod**: Used to define validation schemas for our forms. These schemas are passed to React Hook Form's `zodResolver` for seamless integration.

---

## 4. Backend Architecture (Firebase)

Firebase provides our entire backend infrastructure. The configuration is centralized in `src/lib/firebase.ts`.

### Authentication

- We use Firebase Authentication with the **Email/Password** provider.
- The `AuthProvider` (`src/contexts/auth-context.tsx`) wraps the application and uses `onAuthStateChanged` to monitor the user's login state.
- The `AppLayout` (`src/components/layout/app-layout.tsx`) acts as a guard, redirecting users to `/login` if they are not authenticated and trying to access a protected route.

### Firestore Data Model

Our database is Firestore, a NoSQL document database. Here is the primary collection structure:

- **`users/{userId}`**: Stores public-facing information about a user.
  - `name`: string
  - `email`: string
  - `avatar`: string (URL to image in Firebase Storage)
  - `phone`: string (optional)
  - `address`: string (optional)
  - `createdAt`: timestamp

- **`users/{userId}/pets/{petId}`**: A subcollection for a user's pets. We currently only support one pet per user, stored with the ID `"main-pet"`.
  - `name`: string
  - `breed`: string
  - `age`: string
  - `gender`: "Male" | "Female"
  - `bio`: string
  - `avatar`: string (URL to image in Firebase Storage)

- **`matchRequests/{requestId}`**: Stores requests sent from one user to another.
  - `requesterId`: string (UID of the user sending the request)
  - `targetOwnerId`: string (UID of the user receiving the request)
  - `targetPetId`: string
  - `status`: "pending" | "accepted" | "declined"
  - `createdAt`: timestamp

- **`chats/{chatId}`**: Created when a match request is accepted. The `chatId` is a sorted, concatenated string of the two participants' UIDs (e.g., `uid1_uid2`).
  - `participants`: array of two user UIDs
  - `lastMessage`: string
  - `lastMessageTimestamp`: timestamp

- **`chats/{chatId}/messages/{messageId}`**: Subcollection for messages within a chat.
  - `text`: string
  - `senderId`: string (UID of the message sender)
  - `timestamp`: timestamp

### Firebase Storage

- We use Firebase Cloud Storage to store user-uploaded media.
- **Path Structure**:
  - Owner Avatars: `users/{userId}/owner/avatar.jpg`
  - Pet Avatars: `users/{userId}/pets/main-pet/avatar.jpg`
  - Pet Documents: `users/{userId}/documents/{documentId}` (not yet fully implemented)

---

## 5. Generative AI (Genkit)

We use Genkit, Google's open-source framework for building AI-powered features.

- **Configuration**: `src/ai/genkit.ts` initializes Genkit and the Google AI plugin. It checks for the `GOOGLE_API_KEY` environment variable to enable or disable AI features gracefully.
- **Smart Tagging Flow**: The primary AI feature is "Smart Tagging" for pet documents, defined in `src/ai/flows/smart-tagging.ts`.
  - It defines a Genkit `flow` that takes a document description as input.
  - It uses a `prompt` with a Zod schema for structured output, asking the Gemini model to return an array of relevant tags.
  - The flow is exposed to the frontend via a React Server Action (`src/app/records/actions.ts`). This ensures the `GOOGLE_API_KEY` is never exposed to the client.