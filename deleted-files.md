# Deleted Files Documentation

This document tracks files that have been deleted or marked for deletion as part of the API consolidation process.

## Files Deleted

- `src/components/FlashcardStudy.jsx` - Replaced by React Query implementation in StudyDeck.jsx
- `src/pages/FlashcardStudyExample.jsx` - Replaced by React Query implementation
- `src/services/todo-service.js` - Functionality migrated to src/api/adapters/todoAdapter.js and src/api/queries/todos.js
- `src/services/quiz-service.js` - Functionality migrated to src/api/adapters/quizAdapter.js and src/api/queries/quizzes.js

## Files Marked for Deletion

These files have been deprecated and will be deleted in a future cleanup sprint:

- `src/services/api.js` - Functionality being migrated to individual adapters

## Migration Status

### API Consolidation Plan Phases:

1. ✅ **Phase 1: Complete Flashcard Migration**
   - Update components currently using `flashcardService` directly to use React Query hooks

2. ✅ **Phase 2: Complete Todo Migration**
   - Update components currently using `todoService` directly to use React Query hooks

3. ✅ **Phase 3: Quiz Service Consolidation**
   - Create `src/api/adapters/quizAdapter.js`
   - Move core API functions from `quizService` to the adapter
   - Update `src/api/queries/quizzes.js` to use the adapter
   - Mark old service file with deprecation notice
   - Delete quiz-service.js after migration

4. ✅ **Phase 4: Activity Service Consolidation**
   - Create `src/api/adapters/activityAdapter.js`
   - Move core API functions from various services to the adapter
   - Update `src/api/queries/activities.js` to use the adapter
   - Update components to use the new hooks

### Completed Updates

The following updates have been completed:

1. ✅ Updated `src/components/Quizzes/QuizCreationModal.jsx` to use React Query hooks instead of `quizService.generateQuestions` and `quizService.createQuiz`
2. ✅ Updated `src/pages/EditQuiz.jsx` to use React Query hooks instead of `quizService.getQuiz` and `quizService.updateQuiz`
3. ✅ Updated `src/pages/Flashcards.jsx` to remove import of `flashcardService` from '../services/api'

### Next Steps

The following tasks should be considered for the next cleanup sprint:

1. ✅ Delete `src/services/quiz-service.js` - COMPLETED
2. Gradually migrate functionality from `src/services/api.js` to individual adapters until it can be deleted
3. Consider creating an API migration guide for any new component development 