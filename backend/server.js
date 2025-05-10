const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const studyProgressRoutes = require('./routes/studyProgress');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/flashcards', require('./routes/flashcards')); 
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/study-progress', studyProgressRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 