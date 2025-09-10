# AI Question Generation Setup

This document explains how to set up and use the AI-powered question generation feature in your crypto quiz app.

## Features

- **AI Question Generation**: Generate crypto quiz questions using OpenAI's GPT models
- **Difficulty Levels**: Easy, Medium, and Hard questions with appropriate complexity
- **Topic Selection**: Generate questions for specific crypto topics
- **Question Management**: Full CRUD operations for AI-generated questions
- **Fallback System**: Automatic fallback to predefined questions if AI fails
- **Export/Import**: Export and import question sets in JSON format

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `sk-`)

### 2. Configure API Key

#### Option A: Environment Variable (Recommended)
Create a `.env.local` file in your project root:
```env
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

**Note**: For Vite projects, use `VITE_` prefix. For Create React App, use `REACT_APP_` prefix.

#### Option B: In-App Configuration
1. Go to Admin Panel → Quiz Management → AI Question Generator
2. Click "API Settings" button
3. Enter your OpenAI API key
4. Click "Save"

### 3. Usage

#### For Administrators

1. **Generate Questions**:
   - Go to Admin Panel → Quiz Management → AI Question Generator
   - Select difficulty level (Easy/Medium/Hard)
   - Choose number of questions (3-15)
   - Optionally select a specific topic
   - Click "Generate Questions"

2. **Manage Questions**:
   - Go to Admin Panel → Quiz Management → AI Questions Manager
   - View, edit, activate/deactivate, or delete AI-generated questions
   - Export questions to JSON files
   - Import previously exported question sets

#### For Users

- AI-generated questions are automatically included in quiz sessions
- Questions are mixed with predefined questions for variety
- AI questions are marked with a blue "AI" badge during quizzes

## Question Generation Process

1. **Prompt Engineering**: The system uses carefully crafted prompts to generate high-quality questions
2. **Validation**: Generated questions are validated for format and content
3. **Fallback**: If AI generation fails, the system uses predefined fallback questions
4. **Storage**: Questions are stored locally and can be managed through the admin panel

## Supported Topics

### Easy Level
- Bitcoin basics
- Cryptocurrency fundamentals
- Blockchain basics
- Wallet security
- Trading basics
- Crypto terminology

### Medium Level
- DeFi protocols
- Smart contracts
- Staking mechanisms
- Trading strategies
- Market analysis
- Crypto regulations

### Hard Level
- Advanced cryptography
- Consensus mechanisms
- Scaling solutions
- Cross-chain protocols
- Quantum computing threats
- Advanced trading algorithms

## API Costs

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical cost**: $0.01-0.05 per 10 questions generated
- **Recommendation**: Set up usage limits in your OpenAI account

## Troubleshooting

### Common Issues

1. **"API Key not configured"**
   - Ensure you've set the API key in environment variables or in-app settings

2. **"Failed to generate questions"**
   - Check your internet connection
   - Verify API key is valid and has credits
   - Check OpenAI service status

3. **"Invalid question format"**
   - The AI response couldn't be parsed
   - System will automatically use fallback questions

### Error Handling

The system includes comprehensive error handling:
- Network failures → Fallback questions
- API errors → Fallback questions
- Invalid responses → Fallback questions
- Rate limiting → Automatic retry with backoff

## Security Considerations

- API keys are stored locally in browser storage
- No questions or API keys are sent to external servers (except OpenAI)
- Generated questions are validated before storage
- Admin access is required for question generation

## Future Enhancements

- Support for additional AI models (GPT-4, Claude, etc.)
- Custom prompt templates
- Question quality scoring
- Automated question review
- Multi-language support
- Question difficulty auto-adjustment

## Support

For issues or questions about the AI question generation feature:
1. Check the browser console for error messages
2. Verify your OpenAI API key and credits
3. Ensure you have admin access to the question generation features
