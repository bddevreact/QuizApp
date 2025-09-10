// AI Question Generation Service
// This service integrates with OpenAI API to generate crypto quiz questions

class AIQuestionService {
  constructor() {
    // Use import.meta.env for Vite or fallback to localStorage
    this.apiKey = this.getApiKey()
    this.baseURL = 'https://api.openai.com/v1/chat/completions'
    this.model = 'gpt-3.5-turbo'
    
    // Question templates for different difficulties
    this.questionTemplates = {
      easy: {
        topics: [
          'Bitcoin basics', 'cryptocurrency fundamentals', 'blockchain basics',
          'wallet security', 'trading basics', 'crypto terminology'
        ],
        complexity: 'simple and straightforward',
        explanation: 'basic and easy to understand'
      },
      medium: {
        topics: [
          'DeFi protocols', 'smart contracts', 'staking mechanisms',
          'trading strategies', 'market analysis', 'crypto regulations'
        ],
        complexity: 'intermediate with some technical details',
        explanation: 'detailed with practical examples'
      },
      hard: {
        topics: [
          'advanced cryptography', 'consensus mechanisms', 'scaling solutions',
          'cross-chain protocols', 'quantum computing threats', 'advanced trading algorithms'
        ],
        complexity: 'advanced and technically challenging',
        explanation: 'comprehensive with technical depth'
      }
    }
  }

  // Get API key from various sources
  getApiKey() {
    try {
      // Try Vite environment variables first
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env.VITE_OPENAI_API_KEY || 
               import.meta.env.REACT_APP_OPENAI_API_KEY || 
               localStorage.getItem('openai_api_key') || 
               'your-openai-api-key-here'
      }
      
      // Fallback to localStorage
      return localStorage.getItem('openai_api_key') || 'your-openai-api-key-here'
    } catch (error) {
      console.warn('Could not access environment variables, using localStorage fallback')
      return localStorage.getItem('openai_api_key') || 'your-openai-api-key-here'
    }
  }

  // Generate questions using AI
  async generateQuestions(difficulty = 'easy', count = 5, topic = null) {
    try {
      const template = this.questionTemplates[difficulty]
      const selectedTopic = topic || this.getRandomTopic(template.topics)
      
      const prompt = this.buildPrompt(difficulty, count, selectedTopic, template)
      
      const response = await this.callOpenAI(prompt)
      
      if (response && response.choices && response.choices[0]) {
        const generatedContent = response.choices[0].message.content
        return this.parseGeneratedQuestions(generatedContent, difficulty)
      }
      
      throw new Error('No response from AI service')
    } catch (error) {
      console.error('Error generating AI questions:', error)
      // Fallback to predefined questions
      return this.getFallbackQuestions(difficulty, count)
    }
  }

  // Build the prompt for AI generation
  buildPrompt(difficulty, count, topic, template) {
    return `Generate ${count} cryptocurrency quiz questions with the following specifications:

DIFFICULTY: ${difficulty.toUpperCase()}
TOPIC: ${topic}
COMPLEXITY: ${template.complexity}
EXPLANATION STYLE: ${template.explanation}

REQUIREMENTS:
1. Each question should have exactly 4 multiple choice options (A, B, C, D)
2. Only one correct answer per question
3. Include a detailed explanation for each answer
4. Questions should be about: ${topic}
5. Make questions ${template.complexity}
6. Ensure explanations are ${template.explanation}

FORMAT (JSON):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation here",
      "category": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
}

Generate questions that are:
- Factually accurate about cryptocurrency
- Educational and informative
- Appropriate for ${difficulty} level
- Engaging and thought-provoking

Return only the JSON response, no additional text.`
  }

  // Call OpenAI API
  async callOpenAI(prompt) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert cryptocurrency educator who creates high-quality quiz questions. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  // Parse AI-generated questions
  parseGeneratedQuestions(content, difficulty) {
    try {
      // Clean the content to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid question format')
      }

      // Validate and clean questions
      return parsed.questions.map((q, index) => ({
        id: `ai_${Date.now()}_${index}`,
        question: q.question || `AI Generated Question ${index + 1}`,
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: Math.max(0, Math.min(3, q.correct || 0)),
        explanation: q.explanation || 'No explanation provided',
        category: q.category || 'AI Generated',
        difficulty: difficulty,
        source: 'ai',
        createdAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error parsing AI questions:', error)
      return this.getFallbackQuestions(difficulty, 3)
    }
  }

  // Get random topic from available topics
  getRandomTopic(topics) {
    return topics[Math.floor(Math.random() * topics.length)]
  }

  // Fallback questions when AI fails
  getFallbackQuestions(difficulty, count) {
    const fallbackQuestions = {
      easy: [
        {
          id: `fallback_easy_${Date.now()}`,
          question: "What is the primary purpose of a cryptocurrency wallet?",
          options: [
            "To store physical coins",
            "To store private keys and manage crypto",
            "To mine cryptocurrency",
            "To trade on exchanges"
          ],
          correct: 1,
          explanation: "A cryptocurrency wallet stores private keys that allow you to access and manage your cryptocurrency holdings.",
          category: "Wallet Basics",
          difficulty: "easy",
          source: "fallback"
        },
        {
          id: `fallback_easy_${Date.now() + 1}`,
          question: "What does 'HODL' mean in cryptocurrency?",
          options: [
            "Hold On for Dear Life",
            "High Order Digital Logic",
            "Hold (misspelling)",
            "High Output Digital Ledger"
          ],
          correct: 2,
          explanation: "HODL is a misspelling of 'hold' that became popular in the crypto community to mean holding cryptocurrency long-term.",
          category: "Crypto Slang",
          difficulty: "easy",
          source: "fallback"
        }
      ],
      medium: [
        {
          id: `fallback_medium_${Date.now()}`,
          question: "What is the main advantage of Proof of Stake over Proof of Work?",
          options: [
            "Higher security",
            "Lower energy consumption",
            "Faster transaction speed",
            "Better decentralization"
          ],
          correct: 1,
          explanation: "Proof of Stake consumes significantly less energy than Proof of Work as it doesn't require intensive computational mining.",
          category: "Consensus Mechanisms",
          difficulty: "medium",
          source: "fallback"
        }
      ],
      hard: [
        {
          id: `fallback_hard_${Date.now()}`,
          question: "What is the Byzantine Generals Problem in blockchain?",
          options: [
            "A military strategy",
            "A consensus problem in distributed systems",
            "A trading algorithm",
            "A security protocol"
          ],
          correct: 1,
          explanation: "The Byzantine Generals Problem is a fundamental problem in distributed systems about reaching consensus when some participants may be unreliable or malicious.",
          category: "Advanced Cryptography",
          difficulty: "hard",
          source: "fallback"
        }
      ]
    }

    const questions = fallbackQuestions[difficulty] || fallbackQuestions.easy
    return questions.slice(0, count)
  }

  // Generate questions for specific categories
  async generateQuestionsByCategory(category, difficulty = 'medium', count = 5) {
    const categoryTopics = {
      'Bitcoin': ['Bitcoin basics', 'Bitcoin mining', 'Bitcoin transactions', 'Bitcoin security'],
      'Ethereum': ['Ethereum basics', 'Smart contracts', 'DeFi on Ethereum', 'Ethereum 2.0'],
      'DeFi': ['DeFi protocols', 'Yield farming', 'Liquidity pools', 'DeFi risks'],
      'Trading': ['Trading strategies', 'Technical analysis', 'Market psychology', 'Risk management'],
      'Security': ['Wallet security', 'Private keys', 'Phishing attacks', 'Hardware wallets'],
      'Technology': ['Blockchain technology', 'Consensus mechanisms', 'Scaling solutions', 'Cryptography']
    }

    const topics = categoryTopics[category] || ['General cryptocurrency']
    const selectedTopic = topics[Math.floor(Math.random() * topics.length)]
    
    return await this.generateQuestions(difficulty, count, selectedTopic)
  }

  // Validate question quality
  validateQuestion(question) {
    const errors = []
    
    if (!question.question || question.question.length < 10) {
      errors.push('Question text too short')
    }
    
    if (!question.options || question.options.length !== 4) {
      errors.push('Must have exactly 4 options')
    }
    
    if (typeof question.correct !== 'number' || question.correct < 0 || question.correct > 3) {
      errors.push('Correct answer must be 0-3')
    }
    
    if (!question.explanation || question.explanation.length < 20) {
      errors.push('Explanation too short')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Batch generate questions for all difficulties
  async generateQuestionSet(count = 5) {
    const results = {}
    
    for (const difficulty of ['easy', 'medium', 'hard']) {
      try {
        results[difficulty] = await this.generateQuestions(difficulty, count)
      } catch (error) {
        console.error(`Error generating ${difficulty} questions:`, error)
        results[difficulty] = this.getFallbackQuestions(difficulty, count)
      }
    }
    
    return results
  }

  // Get available topics for question generation
  getAvailableTopics() {
    return {
      easy: this.questionTemplates.easy.topics,
      medium: this.questionTemplates.medium.topics,
      hard: this.questionTemplates.hard.topics
    }
  }

  // Check if API key is configured
  isConfigured() {
    return this.apiKey && 
           this.apiKey !== 'your-openai-api-key-here' && 
           this.apiKey.startsWith('sk-')
  }

  // Set API key
  setApiKey(apiKey) {
    this.apiKey = apiKey
    localStorage.setItem('openai_api_key', apiKey)
  }

  // Load API key from storage
  loadApiKey() {
    const stored = localStorage.getItem('openai_api_key')
    if (stored && stored !== 'your-openai-api-key-here') {
      this.apiKey = stored
    }
  }
}

// Create singleton instance
const aiQuestionService = new AIQuestionService()
aiQuestionService.loadApiKey()

export default aiQuestionService
