#!/usr/bin/env python3
"""
Simple Firebase Database Clear Script
This script clears all data from Firebase Firestore database using your existing Firebase config
"""

import os
import sys
import json
import time
from typing import Dict, List, Any

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from google.cloud import firestore as firestore_client
except ImportError:
    print("❌ Firebase Admin SDK not installed!")
    print("📦 Install it with: pip install firebase-admin")
    sys.exit(1)

def create_firebase_config():
    """Create Firebase config from your existing project"""
    # Your Firebase project configuration
    firebase_config = {
        "type": "service_account",
        "project_id": "quiz-app-81036",
        "private_key_id": "your-private-key-id",
        "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-xxxxx@quiz-app-81036.iam.gserviceaccount.com",
        "client_id": "your-client-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40quiz-app-81036.iam.gserviceaccount.com"
    }
    
    print("🔧 Firebase Configuration Required!")
    print("=" * 50)
    print("To use this script, you need to:")
    print("1. Go to Firebase Console: https://console.firebase.google.com/")
    print("2. Select your project: quiz-app-81036")
    print("3. Go to Project Settings → Service Accounts")
    print("4. Click 'Generate new private key'")
    print("5. Download the JSON file")
    print("6. Rename it to 'serviceAccountKey.json'")
    print("7. Place it in this directory")
    print("")
    print("Alternatively, you can use the browser-based clear tool:")
    print("1. Open your app in browser")
    print("2. Open browser console (F12)")
    print("3. Run: await db.clearAll()")
    print("4. Follow the confirmation dialogs")
    
    return None

def clear_database_with_service_account():
    """Clear database using service account"""
    try:
        # Check if service account file exists
        if not os.path.exists('serviceAccountKey.json'):
            return create_firebase_config()
        
        # Initialize Firebase with service account
        cred = credentials.Certificate('serviceAccountKey.json')
        app = firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        print("✅ Connected to Firebase!")
        
        # Collections to clear
        collections = [
            'users', 'tasks', 'tournaments', 'transactions', 
            'activities', 'quizQuestions', 'leaderboard', 
            'settings', 'taskVerifications', 'referrals', 'achievements'
        ]
        
        print("\n📊 Current Database Statistics:")
        total_docs = 0
        for collection_name in collections:
            try:
                docs = list(db.collection(collection_name).stream())
                count = len(docs)
                total_docs += count
                print(f"  📁 {collection_name}: {count} documents")
            except Exception as e:
                print(f"  ❌ {collection_name}: Error - {e}")
        
        print(f"\n📊 Total documents: {total_docs}")
        
        if total_docs == 0:
            print("✅ Database is already empty!")
            return True
        
        # Confirmation
        print("\n🚨 WARNING: This will permanently delete ALL data!")
        print("Collections that will be cleared:")
        for collection in collections:
            print(f"  - {collection}")
        
        response = input("\n❓ Are you sure? (type 'DELETE ALL' to confirm): ")
        if response != "DELETE ALL":
            print("❌ Operation cancelled")
            return False
        
        # Clear collections
        print("\n🗑️ Clearing database...")
        total_deleted = 0
        
        for collection_name in collections:
            try:
                print(f"\n🧹 Clearing {collection_name}...")
                collection_ref = db.collection(collection_name)
                docs = list(collection_ref.stream())
                
                if not docs:
                    print(f"  📭 {collection_name}: Already empty")
                    continue
                
                # Delete in batches
                batch_size = 500
                deleted_count = 0
                
                for i in range(0, len(docs), batch_size):
                    batch = db.batch()
                    batch_docs = docs[i:i + batch_size]
                    
                    for doc in batch_docs:
                        batch.delete(doc.reference)
                    
                    batch.commit()
                    deleted_count += len(batch_docs)
                    print(f"  🗑️ Deleted {deleted_count}/{len(docs)} documents")
                
                total_deleted += deleted_count
                print(f"  ✅ {collection_name}: Cleared {deleted_count} documents")
                
            except Exception as e:
                print(f"  ❌ Error clearing {collection_name}: {e}")
        
        print(f"\n🎉 Database clear completed!")
        print(f"📊 Total documents deleted: {total_deleted}")
        
        # Verify
        print("\n🔍 Verifying database is empty...")
        remaining_docs = 0
        for collection_name in collections:
            try:
                docs = list(db.collection(collection_name).stream())
                count = len(docs)
                remaining_docs += count
                if count > 0:
                    print(f"  ⚠️ {collection_name}: {count} documents remaining")
            except Exception as e:
                print(f"  ❌ {collection_name}: Error checking - {e}")
        
        if remaining_docs == 0:
            print("✅ Database successfully cleared - all collections are empty!")
        else:
            print(f"⚠️ {remaining_docs} documents still remain in database")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main function"""
    print("🗄️ Simple Firebase Database Clear Tool")
    print("=" * 50)
    
    # Try to clear with service account
    success = clear_database_with_service_account()
    
    if not success:
        print("\n💡 Alternative Methods:")
        print("1. Use the admin panel: /admin/database")
        print("2. Use browser console: await db.clearAll()")
        print("3. Get Firebase service account key and try again")

if __name__ == "__main__":
    main()
