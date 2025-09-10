#!/usr/bin/env python3
"""
Firebase Database Clear Script
This script clears all data from Firebase Firestore database
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

class FirebaseDataClearer:
    def __init__(self, project_id: str, service_account_path: str = None):
        """
        Initialize Firebase Data Clearer
        
        Args:
            project_id: Firebase project ID
            service_account_path: Path to service account JSON file (optional)
        """
        self.project_id = project_id
        self.db = None
        self.collections = [
            'users',
            'tasks', 
            'tournaments',
            'transactions',
            'activities',
            'quizQuestions',
            'leaderboard',
            'settings',
            'taskVerifications',
            'referrals',
            'achievements'
        ]
        
        self.initialize_firebase(service_account_path)
    
    def initialize_firebase(self, service_account_path: str = None):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase app is already initialized
            if firebase_admin._apps:
                app = firebase_admin.get_app()
            else:
                if service_account_path and os.path.exists(service_account_path):
                    # Use service account file
                    cred = credentials.Certificate(service_account_path)
                    app = firebase_admin.initialize_app(cred, {
                        'projectId': self.project_id
                    })
                    print(f"✅ Firebase initialized with service account: {service_account_path}")
                else:
                    # Use default credentials (environment variable or metadata server)
                    app = firebase_admin.initialize_app()
                    print("✅ Firebase initialized with default credentials")
            
            self.db = firestore.client()
            print(f"✅ Connected to Firebase project: {self.project_id}")
            
        except Exception as e:
            print(f"❌ Error initializing Firebase: {e}")
            sys.exit(1)
    
    def get_collection_stats(self) -> Dict[str, int]:
        """Get statistics for all collections"""
        print("📊 Getting database statistics...")
        stats = {}
        total_docs = 0
        
        for collection_name in self.collections:
            try:
                collection_ref = self.db.collection(collection_name)
                docs = list(collection_ref.stream())
                count = len(docs)
                stats[collection_name] = count
                total_docs += count
                print(f"  📁 {collection_name}: {count} documents")
            except Exception as e:
                print(f"  ❌ Error getting stats for {collection_name}: {e}")
                stats[collection_name] = -1
        
        print(f"📊 Total documents: {total_docs}")
        return stats
    
    def clear_collection(self, collection_name: str) -> int:
        """Clear all documents from a collection"""
        try:
            collection_ref = self.db.collection(collection_name)
            docs = list(collection_ref.stream())
            
            if not docs:
                print(f"  📭 {collection_name}: Already empty")
                return 0
            
            # Delete documents in batches
            batch_size = 500
            deleted_count = 0
            
            for i in range(0, len(docs), batch_size):
                batch = self.db.batch()
                batch_docs = docs[i:i + batch_size]
                
                for doc in batch_docs:
                    batch.delete(doc.reference)
                
                batch.commit()
                deleted_count += len(batch_docs)
                print(f"  🗑️ {collection_name}: Deleted {deleted_count}/{len(docs)} documents")
            
            print(f"  ✅ {collection_name}: Cleared {deleted_count} documents")
            return deleted_count
            
        except Exception as e:
            print(f"  ❌ Error clearing {collection_name}: {e}")
            return 0
    
    def clear_all_data(self, confirm: bool = False) -> bool:
        """Clear all data from Firebase database"""
        if not confirm:
            print("🚨 WARNING: This will permanently delete ALL data from Firebase!")
            print("📋 Collections that will be cleared:")
            for collection in self.collections:
                print(f"  - {collection}")
            
            response = input("\n❓ Are you sure you want to continue? (type 'DELETE ALL' to confirm): ")
            if response != "DELETE ALL":
                print("❌ Operation cancelled by user")
                return False
        
        print("\n🗑️ Starting to clear all database data...")
        print("=" * 50)
        
        # Get initial stats
        initial_stats = self.get_collection_stats()
        
        total_deleted = 0
        results = {}
        
        # Clear each collection
        for collection_name in self.collections:
            print(f"\n🧹 Clearing collection: {collection_name}")
            deleted = self.clear_collection(collection_name)
            results[collection_name] = deleted
            total_deleted += deleted
            time.sleep(0.5)  # Small delay to avoid rate limiting
        
        print("\n" + "=" * 50)
        print("🎉 Database clear completed!")
        print(f"📊 Total documents deleted: {total_deleted}")
        print("\n📋 Results:")
        for collection, count in results.items():
            if count > 0:
                print(f"  ✅ {collection}: {count} documents deleted")
            elif count == 0:
                print(f"  📭 {collection}: Already empty")
            else:
                print(f"  ❌ {collection}: Error occurred")
        
        # Verify clearing
        print("\n🔍 Verifying database is empty...")
        final_stats = self.get_collection_stats()
        
        if all(count == 0 for count in final_stats.values()):
            print("✅ Database successfully cleared - all collections are empty!")
            return True
        else:
            print("⚠️ Some collections may still contain data")
            return False
    
    def clear_specific_collections(self, collections: List[str], confirm: bool = False) -> bool:
        """Clear specific collections only"""
        if not confirm:
            print(f"🚨 WARNING: This will clear the following collections: {', '.join(collections)}")
            response = input("❓ Are you sure? (y/N): ")
            if response.lower() != 'y':
                print("❌ Operation cancelled by user")
                return False
        
        print(f"\n🧹 Clearing specific collections: {', '.join(collections)}")
        total_deleted = 0
        
        for collection_name in collections:
            if collection_name in self.collections:
                print(f"\n🧹 Clearing collection: {collection_name}")
                deleted = self.clear_collection(collection_name)
                total_deleted += deleted
            else:
                print(f"⚠️ Unknown collection: {collection_name}")
        
        print(f"\n✅ Cleared {total_deleted} documents from specified collections")
        return True
    
    def clear_user_data_only(self, confirm: bool = False) -> bool:
        """Clear only user-related data"""
        user_collections = ['users', 'transactions', 'activities', 'taskVerifications', 'referrals']
        return self.clear_specific_collections(user_collections, confirm)
    
    def clear_content_data_only(self, confirm: bool = False) -> bool:
        """Clear only content data"""
        content_collections = ['tasks', 'tournaments', 'quizQuestions', 'leaderboard', 'settings', 'achievements']
        return self.clear_specific_collections(content_collections, confirm)

def main():
    """Main function"""
    print("🗄️ Firebase Database Clear Tool")
    print("=" * 40)
    
    # Configuration
    PROJECT_ID = "quiz-app-81036"  # Replace with your Firebase project ID
    
    # Check for service account file
    service_account_path = None
    possible_paths = [
        "serviceAccountKey.json",
        "firebase-service-account.json",
        "service-account.json"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            service_account_path = path
            break
    
    if service_account_path:
        print(f"📁 Found service account file: {service_account_path}")
    else:
        print("📁 No service account file found, using default credentials")
        print("💡 You can place a service account JSON file in the current directory")
    
    # Initialize clearer
    try:
        clearer = FirebaseDataClearer(PROJECT_ID, service_account_path)
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {e}")
        return
    
    # Show menu
    while True:
        print("\n" + "=" * 40)
        print("📋 Choose an option:")
        print("1. 📊 Show database statistics")
        print("2. 🗑️ Clear ALL data")
        print("3. 👥 Clear user data only")
        print("4. 📝 Clear content data only")
        print("5. 🎯 Clear specific collections")
        print("6. ❌ Exit")
        
        choice = input("\n❓ Enter your choice (1-6): ").strip()
        
        if choice == "1":
            clearer.get_collection_stats()
        
        elif choice == "2":
            clearer.clear_all_data()
        
        elif choice == "3":
            clearer.clear_user_data_only()
        
        elif choice == "4":
            clearer.clear_content_data_only()
        
        elif choice == "5":
            print("\n📋 Available collections:")
            for i, collection in enumerate(clearer.collections, 1):
                print(f"  {i}. {collection}")
            
            try:
                selection = input("\n❓ Enter collection numbers (comma-separated): ").strip()
                indices = [int(x.strip()) - 1 for x in selection.split(",")]
                selected_collections = [clearer.collections[i] for i in indices if 0 <= i < len(clearer.collections)]
                
                if selected_collections:
                    clearer.clear_specific_collections(selected_collections)
                else:
                    print("❌ Invalid selection")
            except ValueError:
                print("❌ Invalid input")
        
        elif choice == "6":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice")

if __name__ == "__main__":
    main()
