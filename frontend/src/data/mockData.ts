export interface Lesson {
  id: number;
  title: string;
  completed?: boolean;
  content: string;
  code?: string;
  quiz?: QuizQuestion[];
  assignment?: Assignment;
  keyPoints?: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Assignment {
  title: string;
  description: string;
  starterCode: string;
  expectedOutput: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  thumbnail?: string;
  createdAt?: string;
  views?: number;
}

// No more hardcoded data - all courses will be fetched from the backend API
// or generated via AI on-demand
