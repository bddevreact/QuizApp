// Task Verification Service for tracking user task completion
import firebaseService from './firebaseService'

class TaskVerificationService {
  constructor() {
    this.verificationMethods = {
      quiz: this.verifyQuizCompletion,
      daily_bonus: this.verifyDailyBonus,
      referral: this.verifyReferral,
      level_up: this.verifyLevelUp,
      external_task: this.verifyExternalTask
    }
  }

  // Main verification method
  async verifyTaskCompletion(taskId, userId, taskType, verificationData) {
    try {
      console.log(`🔍 Verifying task completion: ${taskId} for user: ${userId}`)
      
      // Get task details
      const task = await firebaseService.read('tasks', taskId)
      if (!task) {
        throw new Error('Task not found')
      }

      // Check if task is already completed by this user
      const existingCompletion = await this.getTaskCompletion(taskId, userId)
      if (existingCompletion) {
        return {
          success: false,
          message: 'Task already completed',
          data: existingCompletion
        }
      }

      // Verify based on task type
      const verificationMethod = this.verificationMethods[taskType]
      if (!verificationMethod) {
        throw new Error(`Unknown task type: ${taskType}`)
      }

      const verificationResult = await verificationMethod(task, userId, verificationData)
      
      if (verificationResult.success) {
        // Mark task as completed
        await this.markTaskCompleted(taskId, userId, verificationResult.data)
        
        // Give reward
        await this.giveTaskReward(task, userId, verificationResult.data)
        
        return {
          success: true,
          message: 'Task completed successfully',
          data: verificationResult.data
        }
      } else {
        return {
          success: false,
          message: verificationResult.message,
          data: null
        }
      }
    } catch (error) {
      console.error('Error verifying task completion:', error)
      return {
        success: false,
        message: 'Verification failed',
        error: error.message
      }
    }
  }

  // Verify quiz completion
  async verifyQuizCompletion(task, userId, verificationData) {
    try {
      const { quizId, score, difficulty, questionsAnswered } = verificationData
      
      // Check minimum score requirement
      const minScore = task.requirements?.minScore || 60
      if (score < minScore) {
        return {
          success: false,
          message: `Minimum score required: ${minScore}%`
        }
      }

      // Check difficulty requirement
      if (task.requirements?.difficulty && task.requirements.difficulty !== difficulty) {
        return {
          success: false,
          message: `Required difficulty: ${task.requirements.difficulty}`
        }
      }

      return {
        success: true,
        data: {
          quizId,
          score,
          difficulty,
          questionsAnswered,
          completedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Quiz verification failed'
      }
    }
  }

  // Verify daily bonus claim
  async verifyDailyBonus(task, userId, verificationData) {
    try {
      const { date, amount } = verificationData
      
      // Check if user already claimed bonus for this date
      const existingClaim = await firebaseService.queryCollection('daily_bonus_claims', [
        { field: 'userId', operator: '==', value: userId },
        { field: 'date', operator: '==', value: date }
      ])

      if (existingClaim.length > 0) {
        return {
          success: false,
          message: 'Daily bonus already claimed for this date'
        }
      }

      return {
        success: true,
        data: {
          date,
          amount,
          claimedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Daily bonus verification failed'
      }
    }
  }

  // Verify referral
  async verifyReferral(task, userId, verificationData) {
    try {
      const { referredUserId, referralCode } = verificationData
      
      // Check if referral code is valid
      const referrer = await firebaseService.queryCollection('users', [
        { field: 'referralCode', operator: '==', value: referralCode }
      ])

      if (referrer.length === 0) {
        return {
          success: false,
          message: 'Invalid referral code'
        }
      }

      return {
        success: true,
        data: {
          referredUserId,
          referralCode,
          referrerId: referrer[0].userId,
          processedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Referral verification failed'
      }
    }
  }

  // Verify level up
  async verifyLevelUp(task, userId, verificationData) {
    try {
      const { newLevel, xpGained } = verificationData
      
      // Get user data
      const user = await firebaseService.getUser(userId)
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      // Check if user actually leveled up
      if (user.level >= newLevel) {
        return {
          success: false,
          message: 'User has already reached this level'
        }
      }

      return {
        success: true,
        data: {
          newLevel,
          xpGained,
          leveledUpAt: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Level up verification failed'
      }
    }
  }

  // Verify external task (requires manual admin approval)
  async verifyExternalTask(task, userId, verificationData) {
    try {
      const { username, screenshot, taskUrl, description } = verificationData
      
      // Create proof submission for admin review
      const proofSubmission = {
        taskId: task.id,
        userId,
        username,
        screenshot,
        taskUrl,
        description,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        type: 'external_task'
      }

      // Save proof submission
      await firebaseService.create('task_proofs', proofSubmission)

      return {
        success: true,
        data: {
          proofId: proofSubmission.id,
          submittedAt: proofSubmission.submittedAt,
          status: 'pending',
          message: 'Proof submitted for admin review'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit proof'
      }
    }
  }

  // Submit task proof (for external tasks)
  async submitTaskProof(taskId, userId, proofData) {
    try {
      const { username, screenshot, taskUrl, description } = proofData
      
      // Check if task exists
      const task = await firebaseService.read('tasks', taskId)
      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        }
      }

      // Check if user already submitted proof for this task
      const existingProof = await this.getTaskProof(taskId, userId)
      if (existingProof && existingProof.status === 'pending') {
        return {
          success: false,
          message: 'Proof already submitted and pending review'
        }
      }

      // Create proof submission
      const proofSubmission = {
        id: `proof_${Date.now()}_${userId}`,
        taskId,
        userId,
        username,
        screenshot,
        taskUrl,
        description,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        type: 'external_task',
        taskTitle: task.title,
        taskReward: task.reward
      }

      // Save proof submission
      await firebaseService.create('task_proofs', proofSubmission)

      return {
        success: true,
        message: 'Proof submitted successfully. Waiting for admin review.',
        proofId: proofSubmission.id
      }
    } catch (error) {
      console.error('Error submitting task proof:', error)
      return {
        success: false,
        message: 'Failed to submit proof'
      }
    }
  }

  // Get task proof
  async getTaskProof(taskId, userId) {
    try {
      const proofs = await firebaseService.queryCollection('task_proofs', [
        { field: 'taskId', operator: '==', value: taskId },
        { field: 'userId', operator: '==', value: userId }
      ])

      return proofs.length > 0 ? proofs[0] : null
    } catch (error) {
      console.error('Error getting task proof:', error)
      return null
    }
  }

  // Get user's task proofs
  async getUserTaskProofs(userId) {
    try {
      return await firebaseService.queryCollection('task_proofs', [
        { field: 'userId', operator: '==', value: userId }
      ])
    } catch (error) {
      console.error('Error getting user task proofs:', error)
      return []
    }
  }

  // Get all pending task proofs (for admin)
  async getPendingTaskProofs() {
    try {
      return await firebaseService.queryCollection('task_proofs', [
        { field: 'status', operator: '==', value: 'pending' }
      ])
    } catch (error) {
      console.error('Error getting pending task proofs:', error)
      return []
    }
  }

  // Approve task proof (admin only)
  async approveTaskProof(proofId) {
    try {
      // Get proof submission
      const proof = await firebaseService.read('task_proofs', proofId)
      if (!proof) {
        return {
          success: false,
          message: 'Proof not found'
        }
      }

      if (proof.status !== 'pending') {
        return {
          success: false,
          message: 'Proof is not pending'
        }
      }

      // Get task details
      const task = await firebaseService.read('tasks', proof.taskId)
      if (!task) {
        return {
          success: false,
          message: 'Task not found'
        }
      }

      // Update proof status
      await firebaseService.update('task_proofs', proofId, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin'
      })

      // Mark task as completed
      await this.markTaskCompleted(proof.taskId, proof.userId, {
        proofId,
        username: proof.username,
        approvedAt: new Date().toISOString()
      })

      // Give reward
      await this.giveTaskReward(task, proof.userId, {
        proofId,
        username: proof.username,
        approvedAt: new Date().toISOString()
      })

      return {
        success: true,
        message: 'Task proof approved and reward given'
      }
    } catch (error) {
      console.error('Error approving task proof:', error)
      return {
        success: false,
        message: 'Failed to approve proof'
      }
    }
  }

  // Reject task proof (admin only)
  async rejectTaskProof(proofId, reason) {
    try {
      // Get proof submission
      const proof = await firebaseService.read('task_proofs', proofId)
      if (!proof) {
        return {
          success: false,
          message: 'Proof not found'
        }
      }

      if (proof.status !== 'pending') {
        return {
          success: false,
          message: 'Proof is not pending'
        }
      }

      // Update proof status
      await firebaseService.update('task_proofs', proofId, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'admin',
        rejectionReason: reason
      })

      return {
        success: true,
        message: 'Task proof rejected'
      }
    } catch (error) {
      console.error('Error rejecting task proof:', error)
      return {
        success: false,
        message: 'Failed to reject proof'
      }
    }
  }

  // Mark task as completed
  async markTaskCompleted(taskId, userId, completionData) {
    try {
      const completion = {
        taskId,
        userId,
        completedAt: new Date().toISOString(),
        data: completionData,
        status: 'completed'
      }

      await firebaseService.create('task_completions', completion)
      return completion
    } catch (error) {
      console.error('Error marking task completed:', error)
      throw error
    }
  }

  // Give task reward
  async giveTaskReward(task, userId, completionData) {
    try {
      const reward = task.reward || 0
      
      if (reward > 0) {
        // Get current user data
        const user = await firebaseService.getUser(userId)
        if (!user) {
          throw new Error('User not found')
        }

        // Update user balance (add to playable balance)
        const newPlayableBalance = (user.playableBalance || 0) + reward
        const newTotalBalance = newPlayableBalance + (user.bonusBalance || 0)

        await firebaseService.updateUser(userId, {
          totalEarned: (user.totalEarned || 0) + reward,
          playableBalance: newPlayableBalance,
          availableBalance: newTotalBalance
        })

        // Create transaction record
        await firebaseService.createTransaction({
          userId,
          type: 'task_reward',
          amount: reward,
          status: 'completed',
          txHash: `Task_${task.id}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          details: {
            taskId: task.id,
            taskTitle: task.title,
            proofId: completionData.proofId
          }
        })
      }

      return { reward }
    } catch (error) {
      console.error('Error giving task reward:', error)
      throw error
    }
  }

  // Get task completion status
  async getTaskCompletion(taskId, userId) {
    try {
      const completions = await firebaseService.queryCollection('task_completions', [
        { field: 'taskId', operator: '==', value: taskId },
        { field: 'userId', operator: '==', value: userId }
      ])

      return completions.length > 0 ? completions[0] : null
    } catch (error) {
      console.error('Error getting task completion:', error)
      return null
    }
  }
}

// Create singleton instance
const taskVerificationService = new TaskVerificationService()

export default taskVerificationService