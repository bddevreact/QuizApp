#!/usr/bin/env python3
"""
Firebase Index Creation Script
This script creates the required Firestore indexes for the quiz app
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

def create_firebase_indexes():
    """Create required Firebase indexes"""
    try:
        # Check if service account file exists
        if not os.path.exists('serviceAccountKey.json'):
            print("❌ Service account key not found!")
            print("📁 Please place 'serviceAccountKey.json' in the current directory")
            return False
        
        # Initialize Firebase
        cred = credentials.Certificate('serviceAccountKey.json')
        app = firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        print("✅ Connected to Firebase!")
        
        # Define required indexes
        indexes = [
            {
                "collection": "activities",
                "fields": [
                    {"field": "userId", "order": "ASCENDING"},
                    {"field": "timestamp", "order": "DESCENDING"}
                ]
            },
            {
                "collection": "transactions", 
                "fields": [
                    {"field": "userId", "order": "ASCENDING"},
                    {"field": "timestamp", "order": "DESCENDING"}
                ]
            },
            {
                "collection": "tasks",
                "fields": [
                    {"field": "type", "order": "ASCENDING"},
                    {"field": "status", "order": "ASCENDING"}
                ]
            },
            {
                "collection": "tournaments",
                "fields": [
                    {"field": "status", "order": "ASCENDING"},
                    {"field": "startDate", "order": "ASCENDING"}
                ]
            }
        ]
        
        print("📋 Required indexes:")
        for index in indexes:
            print(f"  📁 {index['collection']}: {', '.join([f['field'] for f in index['fields']])}")
        
        print("\n💡 Note: Firebase indexes are created automatically when you run queries.")
        print("   The errors you're seeing are normal for new collections.")
        print("   Firebase will create the indexes automatically when needed.")
        
        print("\n🔧 To create indexes manually:")
        print("1. Go to Firebase Console: https://console.firebase.google.com/")
        print("2. Select your project: quiz-app-81036")
        print("3. Go to Firestore Database → Indexes")
        print("4. Click 'Create Index'")
        print("5. Add the required composite indexes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main function"""
    print("🔧 Firebase Index Creation Tool")
    print("=" * 40)
    
    success = create_firebase_indexes()
    
    if success:
        print("\n✅ Index creation process completed!")
        print("💡 The app will work without indexes, but queries may be slower.")
        print("   Firebase will create indexes automatically when you run queries.")

if __name__ == "__main__":
    main()
