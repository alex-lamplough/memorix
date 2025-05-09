# API Layer Cleanup

## Overview
This project implements a systematic cleanup of the API layer to consolidate the two different approaches previously used:

1. Traditional service objects with direct Axios calls (`src/services/*.js`)
2. React Query hooks with duplicated API calls (`src/api/queries/*.js`)

The new architecture separates concerns and leverages the benefits of both approaches:

- Adapter pattern for raw API calls (`src/api/adapters/*.js`)
- React Query hooks for state management (`src/api/queries/*.js`)

## Benefits
- **Consistent API Access Pattern**: All components use React Query hooks
- **Reduced Code Duplication**: Core API logic defined in one place
- **Better State Management**: Leveraging React Query's powerful features
- **Better Performance**: Automatic caching and deduplication of requests
- **Improved Developer Experience**: Easier to reason about API state

## Architecture

### 1. API Client
`src/api/apiClient.js`
- Maintains the Axios instance
- Handles interceptors for authentication, error handling
- Base functionality shared by all adapters

### 2. Adapters
`src/api/adapters/{resource}Adapter.js`
- Pure functions that make API calls and transform responses
- Handle request cancellation
- Export a cancelAllRequests function for navigation
- Format the data into the shape needed by components

Example:
```javascript
// src/api/adapters/flashcardAdapter.js
export const flashcardAdapter = {
  getAllFlashcardSets: async () => {
    const { signal, cleanup } = createCancellableRequest('flashcards');
    try {
      const response = await apiClient.get('/flashcards', { signal });
      cleanup();
      return response.data;
    } catch (error) {
      cleanup();
      throw error;
    }
  },
  // Other methods...
};
```

### 3. Query Hooks
`src/api/queries/{resource}.js`
- React Query hooks that use the adapters
- Handle caching, stale time, refetching
- Provide loading, error, and data states
- Export cancelAllRequests for navigation

Example:
```javascript
// src/api/queries/flashcards.js
export const useFlashcardSets = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FLASHCARDS],
    queryFn: flashcardAdapter.getAllFlashcardSets,
    staleTime: 1000 * 60 // 1 minute
  });
};
```

## Using the Pattern in Components

### Before
```jsx
import { flashcardService } from '../services/api';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await flashcardService.getAllFlashcardSets();
        setData(result);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle loading, error and data manually
};
```

### After
```jsx
import { useFlashcardSets } from '../api/queries/flashcards';

const MyComponent = () => {
  const { 
    data, 
    isLoading, 
    error,
    refetch 
  } = useFlashcardSets();

  // React Query handles loading, error, and caching automatically
};
```

## Handling Mutations

### Before
```jsx
import { flashcardService } from '../services/api';

const MyForm = () => {
  const handleSubmit = async (formData) => {
    try {
      await flashcardService.createFlashcardSet(formData);
      // Manually update UI or refetch data
    } catch (error) {
      // Handle error
    }
  };
};
```

### After
```jsx
import { useCreateFlashcardSet } from '../api/queries/flashcards';

const MyForm = () => {
  const { mutate, isLoading, error } = useCreateFlashcardSet();

  const handleSubmit = (formData) => {
    mutate(formData, {
      onSuccess: () => {
        // Success handling (optional, as cache invalidation is automatic)
      }
    });
  };
};
```

## Navigation and Request Cancellation
The pattern automatically handles request cancellation when navigating between pages using the `cancelAllRequests` functions exported from each query module. 