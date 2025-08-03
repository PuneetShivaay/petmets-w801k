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
  - **Authentication**: Secure email/password login and user management.
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

The project follows the standard Next.js App Router structure.

```
.
├── src
│   ├── app/                # Main application routes
│   ├── components/         # Reusable UI components (ShadCN, custom)
│   ├── contexts/           # React context providers (Auth, Loading)
│   ├── hooks/              # Custom React hooks (useToast, useMobile)
│   ├── lib/                # Utility functions and Firebase config
│   ├── config/             # Navigation configuration
│   └── ai/                 # Genkit flows and AI-related code
│       ├── flows/
│       └── genkit.ts
├── public/                 # Static assets (images, fonts)
├── ...                     # Configuration files (tailwind, next.js, etc.)
└── README.md
```
