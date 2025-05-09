// Import the activity logger at the top of the file
const activityLogger = require('../utils/activityLogger');

// Inside your POST route for creating a flashcard set - after the flashcard set is created:
const flashcard = await newFlashcard.save();

// Log the activity
await activityLogger.logFlashcardCreation(req.user, flashcard);

res.json(flashcard);

// Inside your PUT route for updating a flashcard set - after the flashcard set is updated:
const updatedFlashcard = await Flashcard.findByIdAndUpdate(req.params.id, { $set: flashcardFields }, { new: true });

// Log the activity as an update
await activityLogger.logActivity({
  userId: req.user.id,
  title: updatedFlashcard.title,
  itemType: 'flashcard',
  actionType: 'update',
  itemId: updatedFlashcard._id,
  metadata: {
    cardCount: updatedFlashcard.cards ? updatedFlashcard.cards.length : 0
  }
});

res.json(updatedFlashcard);

// Inside your study session update endpoint, after updating study progress:
// Log the study activity
await activityLogger.logFlashcardStudy(req.user, flashcard, {
  cardsStudied: req.body.cardsStudied || 0,
  correctPercentage: req.body.correctPercentage || 0,
  timeSpent: req.body.timeSpent || 0
});

res.json(flashcard); 