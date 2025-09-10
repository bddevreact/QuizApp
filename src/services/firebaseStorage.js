// Firebase Storage Service for file uploads
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  getMetadata
} from 'firebase/storage'
import { storage } from '../config/firebase'

class FirebaseStorageService {
  constructor() {
    this.storage = storage
  }

  // Upload file to Firebase Storage
  async uploadFile(file, path, metadata = {}) {
    try {
      const storageRef = ref(this.storage, path)
      const uploadResult = await uploadBytes(storageRef, file, metadata)
      const downloadURL = await getDownloadURL(uploadResult.ref)
      
      return {
        success: true,
        downloadURL,
        path: uploadResult.ref.fullPath,
        metadata: uploadResult.metadata
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Upload image with automatic resizing
  async uploadImage(file, path, options = {}) {
    try {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        format = 'jpeg'
      } = options

      // Create canvas for image resizing
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      return new Promise((resolve, reject) => {
        img.onload = async () => {
          // Calculate new dimensions
          let { width, height } = img
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }

          // Set canvas dimensions
          canvas.width = width
          canvas.height = height

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(async (blob) => {
            try {
              const result = await this.uploadFile(blob, path, {
                contentType: `image/${format}`,
                customMetadata: {
                  originalName: file.name,
                  originalSize: file.size.toString(),
                  compressedSize: blob.size.toString()
                }
              })
              resolve(result)
            } catch (error) {
              reject(error)
            }
          }, `image/${format}`, quality)
        }

        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Upload user profile picture
  async uploadProfilePicture(userId, file) {
    const timestamp = Date.now()
    const path = `users/${userId}/profile_${timestamp}.jpg`
    return await this.uploadImage(file, path, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.9
    })
  }

  // Upload question images
  async uploadQuestionImage(questionId, file) {
    const timestamp = Date.now()
    const path = `questions/${questionId}/image_${timestamp}.jpg`
    return await this.uploadImage(file, path, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.8
    })
  }

  // Upload tournament banners
  async uploadTournamentBanner(tournamentId, file) {
    const timestamp = Date.now()
    const path = `tournaments/${tournamentId}/banner_${timestamp}.jpg`
    return await this.uploadImage(file, path, {
      maxWidth: 1200,
      maxHeight: 600,
      quality: 0.8
    })
  }

  // Get file download URL
  async getDownloadURL(path) {
    try {
      const storageRef = ref(this.storage, path)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error('Error getting download URL:', error)
      throw error
    }
  }

  // Delete file
  async deleteFile(path) {
    try {
      const storageRef = ref(this.storage, path)
      await deleteObject(storageRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // List files in a directory
  async listFiles(path) {
    try {
      const storageRef = ref(this.storage, path)
      const result = await listAll(storageRef)
      
      const files = await Promise.all(
        result.items.map(async (item) => {
          const metadata = await getMetadata(item)
          const downloadURL = await getDownloadURL(item)
          
          return {
            name: item.name,
            fullPath: item.fullPath,
            downloadURL,
            metadata
          }
        })
      )
      
      return files
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  }

  // Get file metadata
  async getFileMetadata(path) {
    try {
      const storageRef = ref(this.storage, path)
      return await getMetadata(storageRef)
    } catch (error) {
      console.error('Error getting file metadata:', error)
      throw error
    }
  }

  // Clean up old files (for maintenance)
  async cleanupOldFiles(path, maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    try {
      const files = await this.listFiles(path)
      const cutoffTime = Date.now() - maxAge
      
      const filesToDelete = files.filter(file => {
        const fileTime = new Date(file.metadata.timeCreated).getTime()
        return fileTime < cutoffTime
      })
      
      const deletePromises = filesToDelete.map(file => 
        this.deleteFile(file.fullPath)
      )
      
      await Promise.all(deletePromises)
      
      return {
        success: true,
        deletedCount: filesToDelete.length
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Create singleton instance
const firebaseStorageService = new FirebaseStorageService()

export default firebaseStorageService
