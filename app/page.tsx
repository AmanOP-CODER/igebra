'use client';

import { useState } from 'react';
import { 
  AcademicCapIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  BookOpenIcon,
  UserGroupIcon,
  HashtagIcon,
  ChartBarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface QuizFormData {
  topic: string;
  subject: string;
  grade: string;
  numberOfQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  additionalInfo: string;
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
    additionalInfo: '',
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
    questionElements.forEach((questionElement) => {
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

  const getImprovementSuggestions = () => {
    const percentage = (quizState.score / quizState.questions.length) * 100;
    if (percentage < 70) {
      return (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <h4 className="text-lg font-medium text-white mb-2">Areas for Improvement</h4>
          <p className="text-slate-300">
            You scored {quizState.score} out of {quizState.questions.length} ({Math.round(percentage)}%).
            Consider reviewing the following areas:
          </p>
          <ul className="list-disc list-inside mt-2 text-slate-300">
            <li>Review the basic concepts</li>
            <li>Practice more questions</li>
            <li>Seek additional resources or explanations</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
            <div className="relative flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-500/20">
                <AcademicCapIcon className="h-16 w-16 text-white" />
              </div>
              <h1 className="text-6xl font-bold heading-gradient">
                AI Quiz Generator
              </h1>
            </div>
          </div>
          <p className="subheading-gradient text-xl font-medium">Create interactive quizzes with AI-powered content</p>
        </div>

        {quizState.questions.length === 0 ? (
          <form onSubmit={handleSubmit} className="card animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="input-container">
                <label className="block text-sm font-medium text-slate-300 mb-2">Topic</label>
                <div className="relative">
                  <LightBulbIcon className="input-icon h-6 w-6" />
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Enter quiz topic"
                    required
                  />
                </div>
              </div>

              <div className="input-container">
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                <div className="relative">
                  <BookOpenIcon className="input-icon h-6 w-6" />
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Enter subject"
                    required
                  />
                </div>
              </div>

              <div className="input-container">
                <label className="block text-sm font-medium text-slate-300 mb-2">Grade Level</label>
                <div className="relative">
                  <UserGroupIcon className="input-icon h-6 w-6" />
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="input-field pl-12"
                    placeholder="Enter grade level"
                    required
                  />
                </div>
              </div>

              <div className="input-container">
                <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
                <div className="relative">
                  <HashtagIcon className="input-icon h-6 w-6" />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numberOfQuestions}
                    onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) })}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div className="input-container">
                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty Level</label>
                <div className="relative">
                  <ChartBarIcon className="input-icon h-6 w-6" />
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="select-field pl-12"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-medium text-slate-300 mb-2">Additional Information (Optional)</label>
              <div className="relative">
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  className="w-full rounded-xl bg-slate-800/50 border-slate-700 text-white shadow-sm 
                           focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200
                           placeholder-slate-400 text-lg py-4 px-6 min-h-[120px]
                           hover:bg-slate-800/70 focus:bg-slate-800/70"
                  placeholder="Add any specific requirements, focus areas, or additional context for the quiz..."
                />
              </div>
              <p className="mt-2 text-sm text-slate-400">
                This information will help generate more relevant and focused questions.
              </p>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-8"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  Generating Quiz...
                </span>
              ) : (
                'Generate Quiz'
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="card animate-fade-in">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 heading-gradient">
                <DocumentTextIcon className="h-6 w-6" />
                Quiz Questions
              </h2>
              <div className="space-y-6">
                {quizState.questions.map((question, index) => (
                  <div key={index} className="question-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <h3 className="text-xl font-medium text-white mb-4">{question.question}</h3>
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = quizState.selectedAnswers[index] === option;
                        const isCorrect = quizState.showResults && option === question.correctAnswer;
                        const isIncorrect = quizState.showResults && isSelected && option !== question.correctAnswer;

                        return (
                          <div
                            key={optionIndex}
                            className={`option-card ${
                              isSelected ? 'selected-option' : ''
                            } ${isCorrect ? 'correct-option' : ''} ${
                              isIncorrect ? 'incorrect-option' : ''
                            }`}
                            onClick={() => !quizState.showResults && handleAnswerSelect(index, option)}
                          >
                            <div className="flex items-center gap-3">
                              {quizState.showResults && (
                                <>
                                  {isCorrect && <CheckCircleIcon className="h-6 w-6 text-emerald-500" />}
                                  {isIncorrect && <XCircleIcon className="h-6 w-6 text-rose-500" />}
                                </>
                              )}
                              <span className="text-slate-300">{option}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!quizState.showResults ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizState.selectedAnswers).length !== quizState.questions.length}
                className="btn-primary"
              >
                Submit Quiz
              </button>
            ) : (
              <div className="card animate-fade-in">
                <h3 className="text-2xl font-semibold mb-6 heading-gradient">
                  Quiz Results
                </h3>
                <div className="space-y-6">
                  <div className="text-center p-8 bg-slate-800/50 rounded-xl">
                    <p className="text-5xl font-bold text-white mb-2">
                      {quizState.score}/{quizState.questions.length}
                    </p>
                    <p className="text-slate-400 text-xl">
                      {Math.round((quizState.score / quizState.questions.length) * 100)}% Correct
                    </p>
                  </div>

                  {getImprovementSuggestions()}

                  <button
                    onClick={() => setQuizState({ questions: [], selectedAnswers: {}, showResults: false, score: 0 })}
                    className="btn-primary"
                  >
                    Generate New Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-16 text-center">
        <p className="text-slate-500 text-sm font-medium">
          Made with ❤️ by <span className="text-slate-400">Aman</span>
        </p>
      </div>
    </main>
  );
} 