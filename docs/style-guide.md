# Memorix Design System & Style Guide

This document outlines the design system and style guide for the Memorix website to ensure consistency across all pages and components.

## Color Palette

### Primary Colors
- **Neon Green (Primary)**: `#00ff94` - Used for interactive elements, accent, and highlights
- **Dark Purple (Background)**: `#2E0033`, `#260041`, `#1b1b2f` - Used for the gradient background

### Secondary Colors
- **Dark Card Background**: `#18092a` (with 60% opacity) - Used for cards and interactive elements
- **Border Color**: `#gray-800` (with 30-50% opacity) - Used for borders on cards and interactive elements

## Typography

- **Primary Font**: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Heading Sizes**:
  - H1: `text-4xl md:text-5xl lg:text-6xl font-extrabold`
  - H2: `text-2xl md:text-3xl font-bold`
  - H3: `text-xl font-bold`
- **Body Text**: `text-base text-white/80`
- **Small Text**: `text-sm text-white/70`

## Components

### Buttons

#### Primary Button
```jsx
<button className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30">
  Button Text
</button>
```

#### Secondary Button
```jsx
<button className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors">
  Button Text
</button>
```

### Cards

```jsx
<div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
  <h3 className="text-xl font-bold mb-3">Card Title</h3>
  <p className="text-white/70 mb-5 text-sm">Card content goes here</p>
</div>
```

### Inputs

```jsx
<input
  type="text"
  className="w-full bg-[#18092a]/60 text-white rounded-xl px-5 py-3.5 border border-gray-800/30 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30 text-sm shadow-lg"
  placeholder="Placeholder text"
/>
```

### Flashcards

```jsx
<div className="bg-[#18092a]/80 border border-[#00ff94]/30 rounded-xl p-6 shadow-lg">
  <div className="flex justify-between items-start">
    <h3 className="text-xl font-bold text-white mb-4">Question/Answer</h3>
    <FlipIcon className="text-[#00ff94]" />
  </div>
  <p className="text-white/90 text-center mt-6 text-lg">Content here</p>
</div>
```

## Layout

### Page Structure
- Background: `bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f]`
- Container: `container mx-auto px-4`
- Vertical spacing: Use consistent spacing with `my-8`, `py-8`, etc.

### Responsiveness
- Use responsive utilities: `sm:`, `md:`, `lg:`, `xl:`
- Mobile-first approach: design for mobile first, then expand for larger screens
- Text sizing: `text-base md:text-lg lg:text-xl`

## Animation & Interactions

### Transitions
- Hover effects: `hover:bg-[#00ff94]/20 transition-colors`
- Element transitions: `transition-all duration-500`

### Special Effects
- Glow effect: `drop-shadow-[0_0_12px_rgba(0,255,148,0.8)]`
- Pulse animation: `animate-pulse`
- 3D card flip: Use the custom CSS classes in index.css

## Code Organization

- Use functional components with React hooks
- Organize imports properly: React imports first, then third-party, then local
- Keep components modular and reusable
- Use TypeScript interfaces for props

## Accessibility Guidelines

- Ensure sufficient color contrast (4.5:1 minimum)
- Use semantic HTML elements
- Include alt text for images
- Ensure keyboard navigation works
- Implement ARIA attributes where necessary 