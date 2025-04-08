# AI Quiz Generator

An AI-powered quiz generator that helps teachers create customized quizzes for their students. Built with Next.js and the Gemini API.

## Features

- Generate quizzes based on topic, subject, grade level, and difficulty
- Customize the number of questions
- AI-powered content generation
- Modern and responsive UI
- Multiple choice questions with correct answers marked

## Prerequisites

- Node.js 18.0 or later
- A Gemini API key from Google AI Studio

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-quiz-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Fill in the quiz details:
   - Topic
   - Subject
   - Grade Level
   - Number of Questions (1-20)
   - Difficulty Level (Easy, Medium, Hard)

2. Click "Generate Quiz" to create your customized quiz.

3. The generated quiz will appear below the form with:
   - Numbered questions
   - Multiple choice options
   - Correct answers marked
   - Proper formatting for easy reading

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini API
- React
- Heroicons

## License

MIT 