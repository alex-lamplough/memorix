# Creating New Components and Pages for Memorix

This guide outlines the process for creating new components and pages for the Memorix website to ensure consistency with the established design system.

## Component Creation Process

### 1. Planning

Before creating a new component:
- Define the component's purpose and functionality
- Identify which existing components it may be similar to
- Review the style guide to ensure consistency
- Determine what props the component will need

### 2. Creating the Component File

Create a new TypeScript file in the appropriate directory:
- For shared components: `src/components/[ComponentName].tsx`
- For page-specific components: `src/components/[PageName]/[ComponentName].tsx`

### 3. Basic Component Structure

Use the following structure for all components:

```tsx
import { useState, useEffect } from 'react'

interface ComponentNameProps {
  // Define props here
}

function ComponentName(props: ComponentNameProps) {
  // State and effects here
  
  return (
    <div className="[tailwind classes following style guide]">
      {/* Component content */}
    </div>
  )
}

export default ComponentName
```

### 4. Styling Guidelines

- Use **only Tailwind CSS** for styling
- Reference the style guide for colors, spacing, typography, etc.
- Follow the established class naming patterns
- Maintain consistent styling with the rest of the application

### 5. Testing Component Rendering

- Test the component in isolation
- Verify responsive behavior on different screen sizes
- Ensure accessibility compliance

## Page Creation Process

### 1. Planning

Before creating a new page:
- Define the page's purpose and content
- Identify which components will be needed
- Plan the layout and user flow
- Review similar pages for consistency

### 2. Creating the Page File

Create a new file in the pages directory:
- `src/pages/[PageName].tsx`

### 3. Basic Page Structure

```tsx
import { useState, useEffect } from 'react'
import Header from '../components/Header'
// Import other components as needed

function PageName() {
  // Page-level state and effects
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page content and components */}
      </main>
    </div>
  )
}

export default PageName
```

### 4. Maintaining Consistency

- Use the same gradient background as other pages
- Maintain consistent spacing and layout
- Reuse existing components where appropriate
- Follow the same animation and interaction patterns

### 5. Responsive Design

- Start with mobile layout and expand to larger screens
- Test thoroughly on multiple device sizes
- Use Tailwind responsive modifiers (`sm:`, `md:`, `lg:`, etc.)
- Ensure content is accessible on all screen sizes

## Best Practices

1. **Component Composition**: Break down complex UIs into smaller, reusable components
2. **Prop Typing**: Always define proper TypeScript interfaces for component props
3. **State Management**: Keep state as local as possible, lift only when necessary
4. **Performance**: Use memoization where appropriate for expensive operations
5. **Documentation**: Add comments for complex logic or non-obvious behavior
6. **Accessibility**: Ensure all components are accessible (keyboard navigation, screen readers, etc.)
7. **Testing**: Test components thoroughly, especially edge cases and error states

## Example: Creating a New Card Component

```tsx
import { ReactNode } from 'react'

interface InfoCardProps {
  title: string
  description: string
  icon?: ReactNode
  accentColor?: string
}

function InfoCard({ 
  title, 
  description, 
  icon, 
  accentColor = '#00ff94' 
}: InfoCardProps) {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      {icon && (
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4`} 
             style={{ backgroundColor: accentColor }}>
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-white/70 mb-4 text-sm">{description}</p>
      <button 
        className="mt-auto text-[#00ff94] border border-[#00ff94] py-2 px-4 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit"
        style={{ color: accentColor, borderColor: accentColor }}
      >
        Learn More
      </button>
    </div>
  )
}

export default InfoCard
``` 