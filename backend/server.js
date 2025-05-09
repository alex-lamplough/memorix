// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/flashcards', require('./routes/flashcards')); 
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/activities', require('./routes/activities')); 