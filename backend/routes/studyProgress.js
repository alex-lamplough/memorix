const express = require('express');
const router = express.Router();
const StudyProgress = require('../models/StudyProgress');
const { requireAuth } = require('../middleware/auth');

// Get study progress for a deck
router.get('/:deckId', requireAuth, async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user.sub;

    const progress = await StudyProgress.findOne({ userId, deckId });
    
    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this deck' });
    }

    res.json(progress);
  } catch (error) {
    console.error('Error fetching study progress:', error);
    res.status(500).json({ message: 'Error fetching study progress' });
  }
});

// Save study progress
router.post('/:deckId', requireAuth, async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user.sub;
    const {
      currentCardIndex,
      learnedCards,
      reviewLaterCards,
      studyMode,
      totalCards
    } = req.body;

    const progress = await StudyProgress.findOneAndUpdate(
      { userId, deckId },
      {
        currentCardIndex,
        learnedCards,
        reviewLaterCards,
        studyMode,
        totalCards,
        lastStudied: new Date()
      },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (error) {
    console.error('Error saving study progress:', error);
    res.status(500).json({ message: 'Error saving study progress' });
  }
});

// Reset study progress
router.delete('/:deckId', requireAuth, async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user.sub;

    await StudyProgress.findOneAndDelete({ userId, deckId });
    res.json({ message: 'Study progress reset successfully' });
  } catch (error) {
    console.error('Error resetting study progress:', error);
    res.status(500).json({ message: 'Error resetting study progress' });
  }
});

module.exports = router; 