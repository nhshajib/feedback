# Peer Feedback System

A simple, reliable web app for collecting peer feedback in public speaking classes (COMM 1100).

## Features

- **No Authentication Required** - Students submit feedback without creating accounts
- **Five Rating Dimensions** - Evaluate preparation, nonverbals, clarity, interest, and dynamism
- **Instructor Dashboard** - View, filter, and export all feedback to CSV
- **Client-Side Only** - All data stored locally in browser (localStorage)
- **Simple & Reliable** - No backend servers, no databases, no complexity

## Core Sections

### Student Feedback Form (`/submit-feedback`)

Students enter:
- Full Name (required)
- Section selection from: COMM 1100-012D, 013D, 014D, 017D (required)
- Speech Type: Introductory, Informative, Social Activism, or Persuasive (required)
- Five required ratings (Needs Improvement → Excellent):
  1. Preparation
  2. Nonverbals
  3. Clarity
  4. Interest
  5. Dynamism
- Optional additional comments

### Instructor Dashboard (`/instructor`)

- View all submitted feedback in a sortable table
- Filter by section, student name, or speech type
- Export filtered data to CSV
- Delete all feedback (with confirmation)

## Technical Details

- **Framework**: React Router v7 (SPA mode)
- **Styling**: CSS Modules + design tokens
- **Storage**: Browser localStorage (no backend)
- **TypeScript**: Full type safety throughout

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Environment Variables

None required! This is a pure client-side app.

## Building for Production

```bash
npm run build
```

Deploy the `build/client/` directory to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## Important Notes

⚠️ **Data Storage**: All feedback is stored in the browser's localStorage. Data:
- Does NOT sync across devices or browsers
- Will be lost if browser data is cleared
- Is limited to ~5-10MB depending on browser
- Is NOT backed up anywhere

For production use with persistent storage, consider migrating to a backend database.
