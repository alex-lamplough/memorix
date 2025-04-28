# Memorix Project Structure

This document outlines the organization of the Memorix project, explaining the purpose of each directory and file to help developers navigate and contribute to the codebase effectively.

## Root Directory Structure

```
memorix/
├── .cursor/         # Cursor IDE configuration and templates
├── docs/            # Documentation files
├── public/          # Static assets served as-is
├── src/             # Source code
│   ├── components/  # React components
│   ├── hooks/       # Custom React hooks
│   ├── context/     # React context providers
│   ├── pages/       # Application pages
│   ├── services/    # External services and API interaction
│   ├── styles/      # Global styles and Tailwind configuration
│   ├── types/       # TypeScript type definitions
│   └── utils/       # Utility functions
├── tests/           # Test files
├── .gitignore       # Git ignore rules
├── package.json     # Project dependencies and scripts
├── tailwind.config.js # Tailwind CSS configuration
└── tsconfig.json    # TypeScript configuration
```

## Detailed Structure

### `/src` Directory

The `/src` directory contains all application source code. Here's how it's organized:

#### `/components`

React components are organized as follows:
- Shared components at the root level
- Page-specific components in subdirectories named after the page

```
/components
├── Button.tsx           # Shared button component
├── Card.tsx             # Shared card component
├── Header.tsx           # Site header
├── Layout.tsx           # Main layout wrapper
├── Input.tsx            # Form input component
├── FlashCard.tsx        # Flashcard component
├── loading/             # Loading components
│   ├── Spinner.tsx
│   └── Skeleton.tsx
└── home/                # Home page specific components
    ├── Hero.tsx
    ├── Features.tsx
    └── Testimonials.tsx
```

#### `/hooks`

Custom React hooks for reusable logic:

```
/hooks
├── useLocalStorage.ts
├── useFlashcards.ts
├── useTheme.ts
└── useAPI.ts
```

#### `/context`

Context providers for state management:

```
/context
├── AuthContext.tsx
├── FlashcardContext.tsx
└── ThemeContext.tsx
```

#### `/pages`

Page components that represent full routes:

```
/pages
├── Home.tsx
├── FlashcardEditor.tsx
├── StudySession.tsx
├── Profile.tsx
└── Settings.tsx
```

#### `/services`

Services for external API communication:

```
/services
├── api.ts              # Base API service
├── authService.ts      # Authentication service
├── flashcardService.ts # Flashcard CRUD operations
└── studyService.ts     # Study session tracking
```

#### `/styles`

Global styles and Tailwind configuration:

```
/styles
├── globals.css         # Global CSS
└── tailwind.css        # Tailwind imports
```

#### `/types`

TypeScript interfaces and types:

```
/types
├── flashcard.ts
├── user.ts
└── study.ts
```

#### `/utils`

Utility functions:

```
/utils
├── formatting.ts       # Date/string formatting
├── validation.ts       # Form validation
└── storage.ts          # Local storage helpers
```

## Naming Conventions

- **Files and Directories**: Use lowercase with dash-separation for directories (`auth-components`), PascalCase for component files (`AuthButton.tsx`), and camelCase for utility files (`formatDate.ts`).
- **Components**: Use PascalCase for component names (e.g., `Button`, `FlashCard`).
- **Hooks**: Use camelCase with `use` prefix (e.g., `useFlashcards`).
- **Context**: Use PascalCase with `Context` suffix (e.g., `AuthContext`).
- **Services**: Use camelCase with `Service` suffix (e.g., `authService`).

## Import Conventions

- Use relative paths for imports within the same or nearby directories
- Use absolute paths for imports across different major directories
- Group imports in the following order:
  1. React and third-party libraries
  2. Components
  3. Hooks, contexts, and services
  4. Types and utilities

Example:
```tsx
// React and libraries
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Components
import Button from '../Button'
import Input from '../Input'

// Hooks and services
import { useAuth } from '../../hooks/useAuth'
import { createFlashcard } from '../../services/flashcardService'

// Types and utilities
import type { Flashcard } from '../../types/flashcard'
import { formatDate } from '../../utils/formatting'
```

## File Structure Conventions

Each file should follow a consistent internal structure:

### Component Files
1. Imports
2. Types/Interfaces
3. Component definition
4. Export statement

### Hook Files
1. Imports
2. Hook definition
3. Export statement

### Service Files
1. Imports
2. API endpoints/constants
3. Service functions
4. Export statement

## Adding New Files

When adding new files:
1. Place them in the appropriate directory based on their purpose
2. Follow the established naming conventions
3. Ensure they export the required functionality
4. Update imports in existing files as needed

## Best Practices

1. **Keep files focused**: Each file should have a single responsibility
2. **Limit file size**: If a component grows too large, consider breaking it into smaller components
3. **Follow the pattern**: Maintain consistency with existing code
4. **Document complex structures**: Add comments for non-obvious code or architecture decisions 