# Memorix API Architecture

This directory contains the consolidated API architecture for the Memorix application. The architecture follows a layered approach with adapters, queries, and utility functions to ensure maintainability and consistency.

## Directory Structure

- `adapters/`: Contains API adapter modules that handle direct communication with the backend
- `queries/`: Contains React Query hooks that use the adapters to provide data fetching, caching, and state management
- `apiClient.js`: Configures and exports the Axios client used by adapters
- `utils.js`: Provides utility functions for error handling and navigation

## Architecture Layers

### 1. API Client (apiClient.js)

The base Axios client with authentication, error handling, and request/response interceptors.

### 2. Adapters

Adapters are responsible for:
- Communicating with the backend API using the apiClient
- Managing cancellation of in-flight requests
- Handling errors and retries
- Transforming data if needed

Example adapters:
- `flashcardAdapter.js`
- `todoAdapter.js`
- `quizAdapter.js`
- `activityAdapter.js`

### 3. React Query Hooks

React Query hooks provide:
- Data fetching with caching
- Loading and error states
- Mutations for creating, updating, and deleting data
- Automatic refetching and background updates

## Usage Guidelines

### Using Adapters

Adapters should only be imported by React Query hooks, not directly by components:

```javascript
// ❌ Don't do this in components
import { flashcardAdapter } from '../api/adapters/flashcardAdapter';

// Inside component
const fetchData = async () => {
  const data = await flashcardAdapter.getFlashcardSets();
  // ...
};
```

### Using React Query Hooks

Components should use React Query hooks for all data operations:

```javascript
// ✅ Do this in components
import { useFlashcardSets, useCreateFlashcard } from '../api/queries/flashcards';

// Inside component
const { data: flashcardSets, isLoading, error } = useFlashcardSets();
const { mutate: createFlashcard } = useCreateFlashcard();

// To create a new flashcard
const handleCreate = () => {
  createFlashcard(newFlashcardData);
};
```

### Handling Navigation and Cancellation

When navigating between routes, use the provided cancellation functionality:

```javascript
import useNavigationWithCancellation from '../hooks/useNavigationWithCancellation';

// Inside component
const navigate = useNavigationWithCancellation();

// Use navigate instead of useNavigate from react-router-dom
const handleClick = () => {
  navigate('/some-route');
};
```

## Migration Guidelines

When migrating existing components:

1. Create/Use an adapter for the specific API domain
2. Create/Use React Query hooks for data operations
3. Replace direct API calls with React Query hooks
4. Update imports to use the new locations

For detailed implementation examples, refer to existing adapters and queries. 