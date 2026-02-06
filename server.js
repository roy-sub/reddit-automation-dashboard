const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// PARSE USERS FROM .env FILE
// Each user has their own Airtable credentials
// ============================================
let USERS = [];
try {
  USERS = JSON.parse(process.env.USERS || '[]');
  console.log(`✓ Loaded ${USERS.length} user(s) from configuration`);
} catch (e) {
  console.error('✗ Error parsing USERS from .env:', e.message);
  console.error('  Please check your .env file format');
  USERS = [];
}

// Active sessions storage
const sessions = new Map();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Get user by session token
function getUserByToken(token) {
  const session = sessions.get(token);
  if (!session) return null;
  return USERS.find(u => u.id === session.userId);
}

// Get Airtable config for user
function getAirtableConfig(user) {
  if (!user) return null;
  return {
    apiKey: user.airtable_api_key,
    baseId: user.airtable_base_id,
    postsTableId: user.posts_table_id,
    subredditsTableId: user.subreddits_table_id
  };
}

// Check if user has valid Airtable config
function hasValidAirtableConfig(user) {
  return user && 
         user.airtable_api_key && 
         user.airtable_base_id &&
         user.posts_table_id &&
         user.subreddits_table_id &&
         !user.airtable_api_key.includes('YOUR_');
}

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }
  
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  req.user = user;
  req.airtable = getAirtableConfig(user);
  next();
}

// ============================================
// API ROUTES
// ============================================

// Login endpoint
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  
  const user = USERS.find(u => u.id === id && u.password === password);
  
  if (user) {
    // Generate session token
    const token = generateToken();
    sessions.set(token, { userId: user.id, createdAt: Date.now() });
    
    res.json({ 
      success: true, 
      message: 'Login successful', 
      userId: user.id,
      token: token,
      hasAirtableConfig: hasValidAirtableConfig(user)
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid ID or Password' });
  }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  const token = req.headers['x-auth-token'];
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get all posts (protected)
app.get('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { apiKey, baseId, postsTableId } = req.airtable;
    
    if (!apiKey || !baseId || !postsTableId) {
      return res.status(400).json({ error: 'Airtable configuration incomplete for this user' });
    }
    
    let allRecords = [];
    let offset = null;
    
    // Handle pagination
    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${postsTableId}`);
      if (offset) url.searchParams.set('offset', offset);
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`Airtable error for user ${req.user.id}:`, data.error);
        return res.status(400).json({ error: data.error.message || 'Airtable API error' });
      }
      
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset;
    } while (offset);
    
    res.json({ records: allRecords });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all subreddits (protected)
app.get('/api/subreddits', authMiddleware, async (req, res) => {
  try {
    const { apiKey, baseId, subredditsTableId } = req.airtable;
    
    if (!apiKey || !baseId || !subredditsTableId) {
      return res.status(400).json({ error: 'Airtable configuration incomplete for this user' });
    }
    
    let allRecords = [];
    let offset = null;
    
    // Handle pagination
    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${subredditsTableId}`);
      if (offset) url.searchParams.set('offset', offset);
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error(`Airtable error for user ${req.user.id}:`, data.error);
        return res.status(400).json({ error: data.error.message || 'Airtable API error' });
      }
      
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset;
    } while (offset);
    
    res.json({ records: allRecords });
  } catch (error) {
    console.error('Error fetching subreddits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new post (protected)
app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { apiKey, baseId, postsTableId } = req.airtable;
    
    if (!apiKey || !baseId || !postsTableId) {
      return res.status(400).json({ error: 'Airtable configuration incomplete for this user' });
    }
    
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${postsTableId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: req.body })
      }
    );
    const data = await response.json();
    
    if (data.error) {
      console.error(`Airtable error for user ${req.user.id}:`, data.error);
      return res.status(400).json({ error: data.error.message || 'Airtable API error' });
    }
    
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

// Clean up expired sessions periodically (every hour)
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > maxAge) {
      sessions.delete(token);
    }
  }
}, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Live : http://localhost:${PORT}`);
});
