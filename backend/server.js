const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Start Agenda Scheduler
const { startScheduler } = require('./services/scheduler');
startScheduler();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for PDF mock downloads
app.use(express.static(path.join(__dirname, 'public')));
app.use('/docs', express.static(path.join(__dirname, 'public/docs')));

// Basic route
app.get('/', (req, res) => {
  res.send('AI Learning App API is running');
});

// Config route for mobile app to discover dynamic URLs
const SystemConfig = require('./models/SystemConfig');
app.get('/api/config', async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ name: 'production_config' });
    res.json({
      ragApiUrl: config?.ragApiUrl || process.env.RAG_API_URL || 'http://192.168.29.57:8000'
    });
  } catch (error) {
    console.error("Config fetch error", error);
    res.json({
      ragApiUrl: process.env.RAG_API_URL || 'http://192.168.29.57:8000'
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/communities', require('./routes/communityRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/planner', require('./routes/plannerRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
