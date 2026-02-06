# Reddit Dashboard

A sleek dashboard to track Reddit posts across subreddits with Airtable integration.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Reddit+Dashboard)

## Features

- ✅ View all interacted subreddits with stats
- ✅ Track organic vs marketing posts
- ✅ See published/unpublished status
- ✅ Add new posts directly from the dashboard
- ✅ View non-interacted subreddits
- ✅ Filter by account ID
- ✅ Beautiful dark theme UI

---

## 🚀 Quick Setup Guide

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Airtable account** with your data tables

### Step 1: Download the Project

Create a new folder and add these 3 files:

```
reddit-dashboard/
├── package.json
├── server.js
└── public/
    └── index.html
```

### Step 2: Install Dependencies

Open terminal/command prompt in the project folder:

```bash
cd reddit-dashboard
npm install
```

### Step 3: Configure Your Credentials

Open `server.js` and update the CONFIG section (lines 11-18):

```javascript
const CONFIG = {
  AIRTABLE_API_KEY: 'your_airtable_api_key_here',
  AIRTABLE_BASE_ID: 'your_base_id_here',
  POSTS_TABLE_ID: 'your_posts_table_id_here',
  SUBREDDITS_TABLE_ID: 'your_subreddits_table_id_here',
  LOGIN_ID: 'your_login_id',
  LOGIN_PASSWORD: 'your_password'
};
```

**How to find your Airtable IDs:**
1. **API Key**: Go to https://airtable.com/create/tokens → Create new token
2. **Base ID**: Open your base → URL looks like `airtable.com/appXXXXXXXX` → `appXXXXXXXX` is your Base ID
3. **Table IDs**: Open each table → URL has `tblXXXXXXXX` → That's your Table ID

### Step 4: Start the Server

```bash
npm start
```

You should see:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Reddit Dashboard Server Running!                     ║
║                                                           ║
║   Open in browser: http://localhost:3000                  ║
║                                                           ║
║   Login credentials:                                      ║
║   ID: 1vs1                                                ║
║   Password: Littleboy@99                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 5: Open the Dashboard

Open your browser and go to: **http://localhost:3000**

---

## 📁 Project Structure

```
reddit-dashboard/
├── package.json          # Project dependencies
├── server.js             # Express server (API proxy)
├── README.md             # This file
└── public/
    └── index.html        # Dashboard frontend (single file)
```

---

## 🔧 Airtable Setup

Your Airtable should have these tables:

### Posts Table
| Field Name     | Type          |
|----------------|---------------|
| Date           | Date          |
| Account ID     | Single line   |
| Post Category  | Single select |
| Calculation    | Formula/URL   |
| Post URL       | URL           |
| Status         | Single select |
| Views          | Number        |

**Post Category options:** `Marketing`, `Semi Marketing`, `Organic`

**Status options:** `Published`, `Mod Review`, `Mod Removed`

### Subreddits Table
| Field Name  | Type        |
|-------------|-------------|
| Name        | Single line |
| Account ID  | Single line |

---

## 🔒 API Token Permissions

When creating your Airtable token, ensure it has:
- ✅ `data.records:read` - Read records
- ✅ `data.records:write` - Create records
- ✅ Access to your specific base

---

## ❓ Troubleshooting

### "Failed to fetch" error
- Check your API key is correct
- Ensure your token has the right permissions
- Verify Base ID and Table IDs are correct

### "No posts found"
- Make sure your Posts table has data
- Check field names match exactly (case-sensitive)

### Port already in use
Change the port in `server.js`:
```javascript
const PORT = 3001; // Change to any available port
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Database**: Airtable
- **Styling**: Custom CSS (dark theme)

---

## 📝 License

MIT License - Feel free to use and modify!
