'use client';

import { useState } from 'react';
import { AcademicCapIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface QuizFormData {
  topic: string;
  subject: string;
  grade: string;
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizState {
  questions: QuizQuestion[];
  selectedAnswers: { [key: number]: string };
  showResults: boolean;
  score: number;
}

export default function Home() {
  const [formData, setFormData] = useState<QuizFormData>({
    topic: '',
    subject: '',
    grade: '',
    numberOfQuestions: 5,
    difficulty: 'medium',
  });
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    selectedAnswers: {},
    showResults: false,
    score: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseQuizContent = (htmlContent: string): QuizQuestion[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const questions: QuizQuestion[] = [];
    
    const questionElements = doc.querySelectorAll('h3');
    questionElements.forEach((questionElement, index) => {
      const question = questionElement.textContent || '';
      const optionsList = questionElement.nextElementSibling;
      const options: string[] = [];
      let correctAnswer = '';
      
      if (optionsList && optionsList.tagName === 'UL') {
        const optionElements = optionsList.querySelectorAll('li');
        optionElements.forEach((option) => {
          const optionText = option.textContent || '';
          if (optionText.includes('(Correct Answer)')) {
            correctAnswer = optionText.replace('(Correct Answer)', '').trim();
            options.push(correctAnswer);
          } else {
            options.push(optionText.trim());
          }
        });
      }
      
      questions.push({ question, options, correctAnswer });
    });
    
    return questions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }

      const questions = parseQuizContent(data.quiz);
      setQuizState({
        questions,
        selectedAnswers: {},
        showResults: false,
        score: 0,
      });
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: {
        ...prev.selectedAnswers,
        [questionIndex]: answer,
      },
    }));
  };

  const calculateScore = () => {
    let score = 0;
    quizState.questions.forEach((question, index) => {
      if (quizState.selectedAnswers[index] === question.correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    setQuizState(prev => ({
      ...prev,
      showResults: true,
      score,
    }));
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-2 text-white">
          <AcademicCapIcon className="h-8 w-8 text-primary" />
          AI Quiz Generator
        </h1>

        {quizState.questions.length === 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Grade Level</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.numberOfQuestions}
                  onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">Difficulty Level</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  className="select-field"
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm mt-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating Quiz...' : 'Generate Quiz'}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-white">
                <DocumentTextIcon className="h-6 w-6 text-secondary" />
                Quiz Questions
              </h2>
              <div className="space-y-6">
                {quizState.questions.map((question, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-medium text-white">{question.question}</h3>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            quizState.selectedAnswers[index] === option
                              ? 'bg-primary/20 border-primary'
                              : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                          } border`}
                          onClick={() => handleAnswerSelect(index, option)}
                        >
                          <div className="flex items-center gap-2">
                            {quizState.showResults && (
                              <>
                                {option === question.correctAnswer ? (
                                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : quizState.selectedAnswers[index] === option ? (
                                  <XCircleIcon className="h-5 w-5 text-red-500" />
                                ) : null}
                              </>
                            )}
                            <span className="text-gray-300">{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!quizState.showResults ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizState.selectedAnswers).length !== quizState.questions.length}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </button>
            ) : (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Quiz Results</h3>
                <p className="text-gray-300">
                  Your score: {quizState.score} out of {quizState.questions.length} (
                  {Math.round((quizState.score / quizState.questions.length) * 100)}%)
                </p>
                <button
                  onClick={() => setQuizState({ questions: [], selectedAnswers: {}, showResults: false, score: 0 })}
                  className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Generate New Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
} 