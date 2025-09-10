# 🗄️ Firebase Database Clear Tool

This Python script allows you to clear all data from your Firebase Firestore database.

## 🚀 Quick Start

### Method 1: Using Batch Script (Windows)
```bash
# Double-click the batch file
clear_database.bat
```

### Method 2: Manual Python Execution
```bash
# Install dependencies
pip install -r requirements.txt

# Run the script
python clear_firebase_data.py
```

## 🔧 Setup Instructions

### 1. Get Firebase Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Rename it to `serviceAccountKey.json`
7. Place it in the same directory as the script

### 2. Update Project ID
Edit `clear_firebase_data.py` and update the `PROJECT_ID` variable:
```python
PROJECT_ID = "your-firebase-project-id"  # Replace with your actual project ID
```

## 📋 Available Operations

### 1. Show Database Statistics
- View current document counts for all collections
- See total documents in database

### 2. Clear ALL Data
- Permanently deletes all data from all collections
- Requires confirmation with "DELETE ALL"
- Shows before/after statistics

### 3. Clear User Data Only
- Clears: users, transactions, activities, taskVerifications, referrals
- Keeps: tasks, tournaments, quiz questions, settings

### 4. Clear Content Data Only
- Clears: tasks, tournaments, quizQuestions, leaderboard, settings, achievements
- Keeps: users, transactions, activities, referrals

### 5. Clear Specific Collections
- Choose which collections to clear
- Select from available collections list

## 🛡️ Safety Features

- **Multiple Confirmations**: Prevents accidental deletion
- **Statistics Display**: Shows what will be deleted
- **Batch Processing**: Handles large datasets efficiently
- **Error Handling**: Graceful handling of connection issues
- **Verification**: Confirms database is empty after clearing

## 📊 Collections Cleared

The script clears these collections:
- `users` - User accounts and profiles
- `tasks` - Daily, marketing, and partner tasks
- `tournaments` - Tournament data and participants
- `transactions` - Payment and earning records
- `activities` - User activity logs
- `quizQuestions` - Quiz content and data
- `leaderboard` - Leaderboard data
- `settings` - App configuration
- `taskVerifications` - Task verification submissions
- `referrals` - Referral system data
- `achievements` - User achievements

## 🔍 Example Usage

```bash
# Run the script
python clear_firebase_data.py

# Choose option 1 to see current stats
📊 Show database statistics

# Choose option 2 to clear all data
🗑️ Clear ALL data

# Follow the confirmation prompts
❓ Are you sure you want to continue? (type 'DELETE ALL' to confirm): DELETE ALL
```

## ⚠️ Important Notes

- **This action cannot be undone!** All data will be permanently deleted
- Make sure you have a backup if needed
- The script uses batch operations for efficiency
- Rate limiting is built-in to avoid Firebase quotas
- Works with both service account and default credentials

## 🐛 Troubleshooting

### "Firebase Admin SDK not installed"
```bash
pip install firebase-admin
```

### "Permission denied" errors
- Make sure your service account has Firestore access
- Check that the service account key is valid
- Verify the project ID is correct

### "Collection not found" errors
- This is normal for empty collections
- The script will continue with other collections

## 📞 Support

If you encounter issues:
1. Check the error messages in the console
2. Verify your Firebase project settings
3. Ensure your service account has proper permissions
4. Check your internet connection

## 🎯 After Clearing

Once the database is cleared:
1. All collections will be empty
2. You can start adding fresh data
3. The admin panel will show empty states
4. Users will see no data until new content is added
