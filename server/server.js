const express = require('express');
const db = require('./db/db');
const dotenv = require('dotenv');
const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('AGURA Ticketing Backend is running! 🎫');
});

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordResetRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});