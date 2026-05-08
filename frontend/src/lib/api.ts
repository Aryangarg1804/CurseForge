const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'API request failed');
  }

  return response.json();
}

export const authAPI = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  async getCurrentUser(): Promise<User> {
    return fetchAPI('/auth/me');
  },
};

interface CourseOptions {
  topic: string;
  difficulty: string;
  modules: number;
  duration: string;
  focus: string;
}

interface CourseLesson {
  title: string;
  content: string;
  keyPoints: string[];
  quiz?: any[];
  assignment?: string;
}

interface Course {
  _id?: string;
  courseId?: string;
  courseTitle: string;
  topic: string;
  lessons: CourseLesson[];
  createdAt?: string;
  views?: number;
}

export const courseAPI = {
  async generateCourse(options: CourseOptions): Promise<Course> {
    return fetchAPI('/courses/generate', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  },

  async generateLessonQuiz(
    courseId: string,
    lessonIndex: number,
    count: number,
    mode: 'lesson' | 'extra' = 'lesson'
  ): Promise<{ questions: any[] }> {
    return fetchAPI(`/courses/${courseId}/lessons/${lessonIndex}/quiz`, {
      method: 'POST',
      body: JSON.stringify({ count, mode }),
    });
  },

  async submitLessonQuiz(
    courseId: string,
    lessonIndex: number,
    payload: { score: number; total: number; incorrectQuestions: any[] }
  ): Promise<{ success: boolean; quizProgress: any }> {
    return fetchAPI(`/courses/${courseId}/lessons/${lessonIndex}/quiz/submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async generateLessonSubjective(
    courseId: string,
    lessonIndex: number,
    count: number
  ): Promise<{ questions: any[] }> {
    return fetchAPI(`/courses/${courseId}/lessons/${lessonIndex}/subjective`, {
      method: 'POST',
      body: JSON.stringify({ count }),
    });
  },

  async getAllCourses(): Promise<Course[]> {
    return fetchAPI('/courses');
  },

  async getCourseById(id: string): Promise<Course> {
    return fetchAPI(`/courses/${id}`);
  },

  async deleteCourse(id: string): Promise<{ success: boolean }> {
    return fetchAPI(`/courses/${id}`, {
      method: 'DELETE',
    });
  },
};
