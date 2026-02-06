const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// ============================================
// CONFIGURATION - Update these values
// ============================================


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// API ROUTES
// ============================================

// Login endpoint
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  
  if (id === CONFIG.LOGIN_ID && password === CONFIG.LOGIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid ID or Password' });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.POSTS_TABLE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all subreddits
app.get('/api/subreddits', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.SUBREDDITS_TABLE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching subreddits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new post
app.post('/api/posts', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE_ID}/${CONFIG.POSTS_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: req.body })
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error adding post:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Live at http://localhost:${PORT}`);
});
