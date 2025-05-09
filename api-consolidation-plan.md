# API Consolidation Plan

## Current State
The codebase currently has two separate mechanisms for making API calls:

1. **`src/services/api.js` and other service files**:
   - Traditional service-based approach with functions for API calls
   - Uses Axios directly
   - Handles cancellation tokens manually
   - Used in components like `StudyDeck.jsx`, `EditDeck.jsx`, `FlashcardCreationModal.jsx`, etc.

2. **`src/api/queries` directory**:
   - Modern React Query-based approach with hooks
   - Handles caching, stale times, and request deduplication
   - Used in components like `Flashcards.jsx`, `Dashboard.jsx`

## Progress Made ✅

1. **Created API Adapters**:
   - Created `src/api/adapters/flashcardAdapter.js` combining functionality from `flashcardService`
   - Created `src/api/adapters/todoAdapter.js` combining functionality from `todoService`

2. **Updated React Query Hooks**:
   - Updated `src/api/queries/flashcards.js` to use the new flashcard adapter
   - Updated `src/api/queries/todos.js` to use the new todo adapter

3. **Updated App.jsx Navigation Handling**:
   - Updated `App.jsx` to use the `cancelAllRequests` functions from the query modules instead of the services

## Next Steps

### Phase 1: Complete Flashcard Migration ✅
- ✅ Update components currently using `flashcardService` directly to use React Query hooks:
  - ✅ `StudyDeck.jsx`
  - ✅ `EditDeck.jsx`
  - ✅ `FlashcardCreationModal.jsx`
  - ✅ `FlashcardModal.jsx`
  - ✅ `ActivityModal.jsx`
  - ✅ `FlashcardSet.jsx`

### Phase 2: Complete Todo Migration ✅
- ✅ Update components currently using `todoService` directly to use React Query hooks:
  - ✅ `Todo.jsx`

### Phase 3: Quiz Service Consolidation ✅
1. ✅ Create `src/api/adapters/quizAdapter.js`
2. ✅ Move core API functions from `quizService` to the adapter
3. ✅ Update `src/api/queries/quizzes.js` to use the adapter
4. ✅ Mark old service file with deprecation notice
5. ✅ Update App.jsx to use cancelAllRequests from quizzes

### Phase 4: Activity Service Consolidation
1. ✅ Create `src/api/adapters/activityAdapter.js`
2. ✅ Move core API functions from various services to the adapter
3. ✅ Update `src/api/queries/activities.js` to use the adapter
4. ✅ Mark old service files with deprecation notices where applicable
5. ✅ Update components to use the new hooks

## Implementation Guidelines

### API Adapter Structure
- Each adapter should be organized by data model (e.g., `flashcardAdapter.js`, `todoAdapter.js`, etc.)
- Include a `requestMap` to track in-flight requests
- Implement cancellation for appropriate requests
- Export a `cancelAllRequests` function to cancel all pending requests during navigation

### React Query Hooks
- Use consistent naming: `use<Action><Model>` (e.g., `useCreateTodo`, `useUpdateFlashcardSet`)
- Organize by data model in the `/api/queries` directory
- Define and export constants for query keys
- Invalidate appropriate queries when mutations occur
- Handle optimistic updates where appropriate

### Component Usage
- Import React Query hooks at the top of the component
- Remove direct imports of service files
- Use `useQuery` hooks for data fetching
- Use `useMutation` hooks for updates, creation, and deletion
- Leverage React Query's loading, error, and data states

## Migration Process Documentation for Team Members

If you need to migrate a component from the old service-based approach to the new React Query pattern, follow these steps:

1. First, check if appropriate React Query hooks already exist in the queries directory
2. If hooks don't exist, create them following the patterns in existing query files
3. Remove imports of the old services
4. Add imports for the relevant React Query hooks
5. Replace service calls with hook invocations
6. Update component state management to use React Query's built-in states

If you encounter any issues during migration:

1. Refer to the example migrations in Phase 1 and 2
2. Check the official [React Query documentation](https://tanstack.com/query/latest/docs/react/overview)
3. Or reach out to the API migration team for assistance.

## Future Considerations

### Global Error Handling
- Implement a consistent error handling strategy across all React Query hooks
- Consider using React Query's global error handling features

### Optimistic Updates
- Implement optimistic updates for all mutation operations
- Include rollback logic for failed operations

### Persistence Layer
- Add cacheing strategies for frequently accessed data
- Implement offline support where applicable

## Code Examples

### Example Component Update
Here's an example of how the `StudyDeck.jsx` component could be refactored to use React Query hooks:

```jsx
// Before:
import { flashcardService } from '../services/api';

const StudyDeck = () => {
  const { id } = useParams();
  const [flashcardSet, setFlashcardSet] = useState(null);
  
  useEffect(() => {
    const loadFlashcardSet = async () => {
      try {
        const data = await flashcardService.getFlashcardSet(id);
        setFlashcardSet(data);
      } catch (error) {
        // Handle error
      }
    };
    
    loadFlashcardSet();
  }, [id]);
  
  // Render component...
};
```

```jsx
// After:
import { useFlashcardSet, useUpdateStudyProgress } from '../api/queries/flashcards';

const StudyDeck = () => {
  const { id } = useParams();
  
  // Use the query hook
  const { 
    data: flashcardSet, 
    isLoading, 
    error 
  } = useFlashcardSet(id);
  
  // Use mutation hook for progress updates
  const { mutate: updateProgress } = useUpdateStudyProgress();
  
  const handleProgressUpdate = (progressData) => {
    updateProgress({ id, progressData });
  };
  
  // Render component with isLoading and error states handled automatically...
};
```

## Benefits of Consolidation
- **Consistent API Access Pattern**: All components use React Query hooks
- **Reduced Code Duplication**: Core API logic defined in one place
- **Better State Management**: Leverage React Query's powerful features
- **Better Performance**: Automatic caching and deduplication of requests
- **Improved Developer Experience**: Easier to reason about API state
- **Better Error Handling**: Standardized approach to error handling

## Implementation Strategy
- Continue implementing updates component by component
- Start with simpler components to establish patterns
- Write tests before migrating complex components
- Document the process for other team members 

## Documentation for Team Members

### Migration Process Guide

#### Step 1: Identify Components to Migrate
1. Look for components importing directly from `src/services/`.
2. Check components using old service functions like `flashcardService.getFlashcardSet()`.
3. Prioritize components in the Phase 1-3 plans above.

#### Step 2: Import React Query Hooks
Replace service imports with the appropriate React Query hooks:
```jsx
// Before
import { flashcardService } from '../services/api';

// After
import { useFlashcardSet, useUpdateStudyProgress } from '../api/queries/flashcards';
```

#### Step 3: Replace State Management
```jsx
// Before
const [flashcardSet, setFlashcardSet] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await flashcardService.getFlashcardSet(id);
      setFlashcardSet(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  loadData();
}, [id]);

// After
const { 
  data: flashcardSet, 
  isLoading, 
  error 
} = useFlashcardSet(id);
```

#### Step 4: Replace Direct API Calls with Mutations
```jsx
// Before
const handleSave = async () => {
  try {
    await flashcardService.updateFlashcardSet(id, updatedData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};

// After
const { mutate: updateFlashcardSet, isLoading: isSaving } = useUpdateFlashcardSet();

const handleSave = () => {
  updateFlashcardSet({ id, flashcardSet: updatedData }, {
    onSuccess: () => {
      // Optional success handling
    },
    onError: (error) => {
      // Optional error handling
    }
  });
};
```

#### Step 5: Testing
1. Ensure the component loads data correctly.
2. Verify mutations work and update the UI appropriately.
3. Test navigation to ensure requests are properly cancelled.
4. Check that caching works as expected when revisiting pages.

### Common React Query Patterns

#### Query Invalidation
React Query automatically invalidates related queries after mutations. For example, updating a flashcard set will invalidate both the specific flashcard query and the list of all flashcards:

```jsx
// From src/api/queries/flashcards.js
const useUpdateFlashcardSet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, flashcardSet }) => 
      flashcardAdapter.updateFlashcardSet(id, flashcardSet),
    onSuccess: (data, variables) => {
      // Invalidate specific queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FLASHCARD(variables.id) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FLASHCARDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FAVORITES] });
    },
  });
};
```

#### Optimistic Updates
For a better user experience, implement optimistic updates for immediate UI feedback:

```jsx
const { mutate } = useToggleTodoComplete();

const handleToggle = (id, currentStatus) => {
  mutate(
    { id, isCompleted: !currentStatus },
    {
      // Optimistically update the UI
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: QUERY_KEYS.TODOS });
        
        // Save previous state
        const previousTodos = queryClient.getQueryData([QUERY_KEYS.TODOS]);
        
        // Optimistically update to the new value
        queryClient.setQueryData([QUERY_KEYS.TODOS], old => 
          old.map(todo => 
            todo.id === id ? { ...todo, isCompleted: !currentStatus } : todo
          )
        );
        
        // Return context with the previous state
        return { previousTodos };
      },
      // If the mutation fails, roll back to the previous state
      onError: (err, variables, context) => {
        if (context?.previousTodos) {
          queryClient.setQueryData([QUERY_KEYS.TODOS], context.previousTodos);
        }
      }
    }
  );
};
```

### Troubleshooting Tips

1. **Query not updating**: Check if the query key is properly invalidated after related mutations.

2. **Stale data**: Adjust the `staleTime` option in the useQuery hook. Shorter times will refetch more frequently.

3. **Excessive refetching**: Increase `staleTime` or disable `refetchOnWindowFocus` if appropriate.

4. **Error handling**: Utilize the `onError` option in mutations or use the `error` state from queries.

5. **Component not re-rendering**: Ensure you're destructuring the values from the hook result, not the hook itself.

### Questions?

If you encounter any issues during migration, please refer to:
1. The adapter implementation in `src/api/adapters/`
2. The React Query hooks in `src/api/queries/`
3. Or reach out to the API migration team for assistance. 