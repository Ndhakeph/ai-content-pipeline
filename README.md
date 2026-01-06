# AI Content Pipeline

An AI-powered content generation system built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Next.js 14** with App Router for modern React development
- **TypeScript** for type-safe code
- **Tailwind CSS** for utility-first styling
- **ESLint** for code quality

## Project Structure

```
ai-content-pipeline/
├── app/              # Next.js App Router pages and layouts
├── components/       # Reusable UI components
├── lib/              # Utility functions and API logic
├── types/            # TypeScript type definitions
├── public/           # Static assets
└── ...config files
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Development

### Adding Components

Create reusable components in the `/components` directory:

```typescript
// components/Button.tsx
export default function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-500 text-white rounded">{children}</button>;
}
```

### API Routes

Create API routes in `/app/api` directory for backend functionality.

### Type Definitions

Add TypeScript interfaces and types in the `/types` directory for better type safety across the application.

## License

MIT
# Updated Tue Jan  6 23:04:59 IST 2026
# Updated Tue Jan  6 23:06:31 IST 2026
