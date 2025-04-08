import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { topic, subject, grade, numberOfQuestions, difficulty } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    // Get the generative model - using Gemini 1.5 Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Create the prompt
    const prompt = `Create a ${difficulty} difficulty quiz for ${grade} grade students about ${topic} in ${subject}.
    The quiz should have ${numberOfQuestions} questions.
    Format the quiz in HTML with the following structure:
    - Each question should be numbered and in a <h3> tag
    - Multiple choice options should be in a <ul> tag with <li> tags
    - The correct answer should be marked with (Correct Answer) at the end
    - Add a <hr> tag between questions
    - Make sure the content is appropriate for the grade level`;

    try {
      // Generate the quiz using the new API structure
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      const response = await result.response;
      const quiz = response.text();

      if (!quiz) {
        throw new Error('Generated quiz is empty');
      }

      return NextResponse.json({ quiz });
    } catch (generationError: any) {
      console.error('Specific generation error:', generationError);
      return NextResponse.json(
        { 
          error: 'Error during quiz generation',
          details: generationError.message || 'Unknown generation error',
          status: generationError.status || 'Unknown status'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('General error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error.message || 'Unknown error',
        status: error.status || 'Unknown status'
      },
      { status: 500 }
    );
  }
} 