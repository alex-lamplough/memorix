# Memorix Coding Standards

This document outlines the coding standards and best practices for the Memorix project. Following these guidelines ensures code consistency, maintainability, and quality across the codebase.

## TypeScript/JavaScript

### General

- Use TypeScript for all new code
- Use functional programming patterns where possible
- Prefer immutability (use `const` over `let`, avoid mutating objects/arrays)
- Use early returns to avoid deep nesting
- Limit line length to 100 characters

### Naming

- Use descriptive variable names that indicate purpose
- Use camelCase for variables, functions, and methods
- Use PascalCase for classes, interfaces, types, and React components
- Use UPPER_SNAKE_CASE for constants
- Use boolean variables with auxiliary verbs: `isLoading`, `hasError`, `shouldRefresh`

### Functions

- Use named function declarations for top-level functions
- Use arrow functions for callbacks and anonymous functions
- Keep functions small and focused on a single responsibility
- Document complex functions with JSDoc comments
- Use the RORO (Receive an Object, Return an Object) pattern for complex functions:

```typescript
// Instead of this:
function createUser(name: string, email: string, role: string): User {
  // implementation
}

// Do this:
function createUser({ name, email, role }: CreateUserParams): User {
  // implementation
}
```

### Typing

- Always define types for function parameters and return values
- Prefer interfaces over type aliases for object definitions
- Use union types for variables that can have multiple types
- Use generics for reusable components and functions
- Define shared types in dedicated type files

```typescript
// Example interface definition
interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
}

// Example union type
type UserRole = 'admin' | 'editor' | 'viewer'

// Example generic type
type ApiResponse<T> = {
  data: T
  status: number
  message: string
}
```

### Exports and Imports

- Prefer named exports over default exports
- Group imports by type (React, third-party, internal)
- Sort imports alphabetically within each group
- Use absolute imports for modules from different directories
- Use relative imports for modules in the same or adjacent directories

## React Components

### Component Structure

- Use functional components with hooks
- Define prop interfaces above component declarations
- Apply destructuring for props and state variables
- Use optional chaining and nullish coalescing for safe property access
- Place helper functions outside the component if they don't use component state

```typescript
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'tertiary'
  isDisabled?: boolean
}

export function Button({
  label,
  onClick,
  variant = 'primary',
  isDisabled = false
}: ButtonProps) {
  const buttonClasses = getButtonClasses(variant, isDisabled)
  
  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled}
    >
      {label}
    </button>
  )
}

// Helper function placed outside component
function getButtonClasses(variant: string, isDisabled: boolean): string {
  // Implementation
}
```

### State Management

- Keep state as local as possible
- Lift state up only when necessary
- Use Context API for global state
- Prefer controlled components over uncontrolled ones
- Use appropriate hooks for different scenarios:
  - `useState` for simple local state
  - `useReducer` for complex state logic
  - `useContext` for shared state
  - `useMemo` for expensive computations
  - `useCallback` for stable callbacks

### Component Design

- Build small, reusable components
- Follow composition over inheritance
- Implement prop validation with TypeScript
- Design components with props for customization
- Create specialized components instead of using conditional rendering

## Styling with Tailwind CSS

- Use Tailwind's utility classes for styling
- Follow mobile-first approach for responsive design
- Use consistent spacing, colors, and typography via design tokens
- Extract common class combinations into reusable components
- Use `@apply` directives sparingly, prefer composition
- Apply consistent naming for custom Tailwind extensions

```typescript
// Example of good Tailwind usage
function Card({ title, content }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{content}</p>
    </div>
  )
}
```

## Error Handling

- Use try/catch blocks for error-prone operations
- Implement error boundaries for component-level error handling
- Provide meaningful error messages to users
- Log errors for debugging purposes
- Handle expected errors gracefully in the UI

```typescript
try {
  await saveFlashcard(cardData)
} catch (error) {
  if (error instanceof ApiError) {
    setErrorMessage(error.message)
    logError('Failed to save flashcard', error)
  } else {
    setErrorMessage('An unexpected error occurred')
    logError('Unknown error saving flashcard', error)
  }
}
```

## Performance

- Memoize expensive calculations with `useMemo`
- Use `React.memo` for components that render often with the same props
- Virtualize long lists with `react-window` or similar
- Lazy load components and routes
- Optimize re-renders by avoiding unnecessary state updates
- Use performance profiling tools to identify bottlenecks

## Testing

- Write unit tests for utility functions
- Write component tests for UI components
- Write integration tests for key user flows
- Use Jest and React Testing Library
- Follow the AAA pattern (Arrange, Act, Assert)
- Test component behavior, not implementation details

```typescript
// Example test
describe('Button component', () => {
  it('calls onClick when clicked', () => {
    // Arrange
    const handleClick = jest.fn()
    render(<Button label="Click me" onClick={handleClick} />)
    
    // Act
    fireEvent.click(screen.getByText('Click me'))
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes where necessary
- Ensure keyboard navigation works for all interactive elements
- Maintain sufficient color contrast
- Provide alt text for images
- Test with screen readers and keyboard-only navigation

## Code Reviews

When reviewing code, focus on:

1. Adherence to these coding standards
2. Potential bugs or edge cases
3. Performance implications
4. Security vulnerabilities
5. Test coverage
6. Code readability and maintainability

## Version Control

- Write clear, concise commit messages
- Use present tense for commit messages
- Reference issue numbers in commits and PRs
- Keep commits focused on specific changes
- Follow the branch naming convention: `type/description` (e.g., `feature/add-flashcard-search`, `fix/login-redirect`)

## Documentation

- Document complex functions with JSDoc comments
- Keep README files updated
- Document architecture decisions
- Include examples for non-obvious code
- Comment "why" not "what" the code does 