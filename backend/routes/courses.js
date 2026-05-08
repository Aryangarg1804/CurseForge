import express from 'express';
import axios from 'axios';
import Course from '../models/Course.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_GLOBAL_LIMIT = 10;
const GROQ_WINDOW_MS = 60 * 60 * 1000;

let groqWindowStart = Date.now();
let groqRequestCount = 0;

const reserveGroqRequestSlot = () => {
    const now = Date.now();
    if (now - groqWindowStart >= GROQ_WINDOW_MS) {
        groqWindowStart = now;
        groqRequestCount = 0;
    }

    if (groqRequestCount >= GROQ_GLOBAL_LIMIT) {
        const retryAfterMs = Math.max(0, GROQ_WINDOW_MS - (now - groqWindowStart));
        const error = new Error(`Global Groq API rate limit reached (${GROQ_GLOBAL_LIMIT} requests/hour). Please try again later.`);
        error.statusCode = 429;
        error.code = 'GROQ_GLOBAL_RATE_LIMIT_EXCEEDED';
        error.retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
        throw error;
    }

    groqRequestCount += 1;
};

const callGroqChatCompletions = async (payload, apiKey) => {
    reserveGroqRequestSlot();
    return axios.post(
        GROQ_API_URL,
        payload,
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );
};

// Generate Course
router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const { topic, difficulty, modules, duration, focus } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
        }

      
        const lessonCount = modules || 4;
        const difficultyLevel = difficulty || 'intermediate';
        const learningFocus = focus || 'balanced';

        const wordsPerLesson = lessonCount <= 4 ? '900-1200' : '700-1000';
        const prompt = `Generate a ${lessonCount}-lesson course on: ${topic}

Difficulty Level: ${difficultyLevel}
Learning Focus: ${learningFocus}

Each lesson should be concise but thorough (${wordsPerLesson} words). Use:
- Short paragraphs
- Bullet lists
- Tables where helpful
- Fenced code blocks when relevant (especially for programming topics)

If the topic is programming/technical, include at least one fenced code block and one inline code example per lesson.
If the topic is a biography/person/history, keep content concise and include a "Quick Facts" bullet list and a brief timeline list.
Use headings to structure each lesson clearly.

Do NOT generate any quiz questions, MCQs, objective questions, subjective questions, assignments, tests, or exercises.
Generate learning lesson content only.

Return ONLY valid JSON that EXACTLY matches this schema. Do not add or remove keys. Do not wrap anything in markdown fences. Do not include extra text.
All newline characters inside strings MUST be escaped as \\n. Do not use raw newlines inside strings.

Schema:
{
  "courseTitle": string,
  "lessons": [
    {
      "title": string,
      "content": string,
      "keyPoints": [string, string, string, string, string]
    }
  ]
}

Rules:
- "lessons" length MUST equal ${lessonCount}.
- "keyPoints" MUST be an array of exactly 5 strings (no objects).
- "content" MUST be markdown text only, not JSON, not YAML, not lists of objects.
- Do NOT invent additional sections outside the lesson content. Use markdown headings inside "content".
- Output must be valid JSON parseable by standard JSON parser.`;

        // Call Groq API
        const response = await callGroqChatCompletions(
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a strict JSON generator. Output ONLY valid JSON that exactly matches the provided schema. No markdown fences, no commentary, no extra keys, no variations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4500
            },
            process.env.GROQ_API_KEY
        );

        const responseContent = response.data.choices[0].message.content;

        // parse the JSON response
        let courseData;
        const normalizeJsonStrings = (input) => {
            let result = '';
            let inString = false;
            let escaped = false;
            for (let i = 0; i < input.length; i += 1) {
                const ch = input[i];
                if (escaped) {
                    result += ch;
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    result += ch;
                    escaped = true;
                    continue;
                }
                if (ch === '"') {
                    inString = !inString;
                    result += ch;
                    continue;
                }
                if (inString) {
                    if (ch === '\n') {
                        result += '\\n';
                        continue;
                    }
                    if (ch === '\r') {
                        result += '\\r';
                        continue;
                    }
                    if (ch === '\t') {
                        result += '\\t';
                        continue;
                    }
                }
                result += ch;
            }
            return result;
        };

        const fixInvalidEscapes = (input) => {
            let result = '';
            let inString = false;
            let escaped = false;
            for (let i = 0; i < input.length; i += 1) {
                const ch = input[i];
                if (escaped) {
                    const next = ch;
                    const isValidEscape = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u'].includes(next);
                    if (!isValidEscape) {
                        result += '\\\\' + next;
                    } else {
                        result += '\\' + next;
                    }
                    escaped = false;
                    continue;
                }
                if (ch === '\\') {
                    if (inString) {
                        escaped = true;
                        continue;
                    }
                    result += ch;
                    continue;
                }
                if (ch === '"') {
                    inString = !inString;
                    result += ch;
                    continue;
                }
                result += ch;
            }
            if (escaped) {
                result += '\\';
            }
            return result;
        };

        const parseCourseJson = (raw) => {
            // Aggressive JSON cleaning
            let cleanedContent = raw
                .replace(/```json\n?/gi, '')  // Remove ```json
                .replace(/```\n?/g, '')        // Remove ```
                .replace(/```c\n?/gi, '')      // Remove ```c
                .trim();

            // Remove any text before first { and after last }
            const firstBrace = cleanedContent.indexOf('{');
            const lastBrace = cleanedContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
            }

            // Fix common escape issues
            cleanedContent = cleanedContent
                .replace(/\\\*/g, '*')         // Fix \* to *
                .replace(/\\'/g, "'")          // Fix \' to '
                .replace(/\t/g, ' ');          // Replace tabs with space

            cleanedContent = normalizeJsonStrings(cleanedContent);
            cleanedContent = fixInvalidEscapes(cleanedContent);
            return JSON.parse(cleanedContent);
        };

        try {
            courseData = parseCourseJson(responseContent);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw Response (first 1000 chars):', responseContent.substring(0, 1000));
            try {
                // Keep repair prompt small to stay within provider TPM limits.
                const repairSource = responseContent.length > 3500
                    ? `${responseContent.slice(0, 3500)}\n\n[truncated]`
                    : responseContent;
                const repairResponse = await callGroqChatCompletions(
                    {
                        model: 'llama-3.1-8b-instant',
                        messages: [
                            {
                                role: 'system',
                                content: 'Fix invalid JSON. Return ONLY valid JSON that matches the input schema. No markdown fences.'
                            },
                            {
                                role: 'user',
                                content: `Fix this JSON:\n\n${repairSource}`
                            }
                        ],
                        temperature: 0.2,
                        max_tokens: 1800,
                        response_format: { type: 'json_object' }
                    },
                    process.env.GROQ_API_KEY
                );
                const repairedContent = repairResponse.data.choices[0].message.content;
                courseData = JSON.parse(repairedContent);
            } catch (repairError) {
                console.error('JSON Repair Error:', repairError.response?.data || repairError.message);
                return res.status(500).json({
                    error: 'Failed to parse AI response',
                    details: 'The AI returned invalid JSON. Please try a different topic or try again.'
                });
            }
        }

        if (courseData.lessons && courseData.lessons.length > 0) {
            courseData.lessons = courseData.lessons.map((lesson) => ({
                ...lesson,
                content: typeof lesson.content === 'string'
                    ? lesson.content
                    : JSON.stringify(lesson.content, null, 2),
                keyPoints: Array.isArray(lesson.keyPoints)
                    ? lesson.keyPoints.map((point) => String(point)).slice(0, 5)
                    : []
            }));
        }

        // Save to MongoDB
        try {
            const course = new Course({
                ...courseData,
                topic: topic,
                userId: req.user.id
            });
            const savedCourse = await course.save();
            console.log('✅ Course saved to database:', savedCourse._id);

            res.json({
                ...courseData,
                courseId: savedCourse._id
            });
        } catch (dbError) {
            console.error('Database save error:', dbError);
            // Still return the course even if save fails
            res.json(courseData);
        }

    } catch (error) {
        console.error('Error generating course:', error.response?.data || error.message);
        if (error.code === 'GROQ_GLOBAL_RATE_LIMIT_EXCEEDED') {
            if (error.retryAfterSeconds) {
                res.set('Retry-After', String(error.retryAfterSeconds));
            }
            return res.status(429).json({
                error: 'Grok API global rate limit reached',
                details: `${GROQ_GLOBAL_LIMIT} requests/hour shared across all users. Please retry later.`
            });
        }
        res.status(500).json({
            error: 'Failed to generate course',
            details: error.response?.data || error.message
        });
    }
});

// Generate quiz questions for a specific lesson
router.post('/:id/lessons/:lessonIndex/quiz', authenticateToken, async (req, res) => {
    try {
        const { count, mode } = req.body || {};
        const requestedCount = Math.min(Math.max(parseInt(count, 10) || 5, 3), 20);
        const lessonIndex = parseInt(req.params.lessonIndex, 10);

        if (Number.isNaN(lessonIndex) || lessonIndex < 0) {
            return res.status(400).json({ error: 'Invalid lesson index' });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
        }

        const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const lesson = course.lessons?.[lessonIndex];
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const rawContent = typeof lesson.content === 'string' ? lesson.content : JSON.stringify(lesson.content || {});
        const trimmedContent = rawContent.length > 4500 ? `${rawContent.slice(0, 4500)}\n\n[Content truncated]` : rawContent;
        const keyPoints = Array.isArray(lesson.keyPoints) ? lesson.keyPoints.slice(0, 5) : [];
        const modeLabel = mode === 'extra' ? 'additional practice' : 'lesson recap';

        const prompt = `Create ${requestedCount} multiple-choice quiz questions for the lesson below (${modeLabel}).

Lesson Title: ${lesson.title || 'Lesson'}
Key Points: ${keyPoints.join(' | ') || 'N/A'}
Lesson Content (truncated if long):
${trimmedContent}

Return ONLY valid JSON that matches this schema exactly. No markdown fences. No extra keys.
{
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctAnswer": number,
      "explanation": string
    }
  ]
}

Rules:
- "correctAnswer" must be an integer from 0 to 3 (index in options).
- Provide exactly 4 options per question.
- Make questions clear, unambiguous, and grounded in the lesson content.
- Keep explanations concise (1-2 sentences).`;

        const response = await callGroqChatCompletions(
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a strict JSON generator. Output ONLY valid JSON that exactly matches the provided schema.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.4,
                max_tokens: 2000
            },
            process.env.GROQ_API_KEY
        );

        const responseContent = response.data.choices[0].message.content;
        const cleaned = responseContent
            .replace(/```json\n?/gi, '')
            .replace(/```\n?/g, '')
            .trim();

        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) {
            return res.status(500).json({ error: 'Invalid quiz response format' });
        }

        let parsed;
        try {
            parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
        } catch (parseError) {
            console.error('Quiz JSON Parse Error:', parseError);
            return res.status(500).json({ error: 'Failed to parse quiz response' });
        }

        const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
        const normalized = questions
            .filter((q) => q && typeof q.question === 'string' && Array.isArray(q.options))
            .map((q) => {
                const options = q.options.filter((opt) => typeof opt === 'string').slice(0, 4);
                while (options.length < 4) options.push('N/A');
                let correctAnswer = Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0;
                if (correctAnswer < 0 || correctAnswer > 3) correctAnswer = 0;
                const explanation = typeof q.explanation === 'string' && q.explanation.trim()
                    ? q.explanation.trim()
                    : 'No explanation provided.';
                return {
                    question: q.question.trim(),
                    options,
                    correctAnswer,
                    explanation
                };
            });

        res.json({ questions: normalized.slice(0, requestedCount) });
    } catch (error) {
        console.error('Error generating quiz:', error.response?.data || error.message);
        if (error.code === 'GROQ_GLOBAL_RATE_LIMIT_EXCEEDED') {
            if (error.retryAfterSeconds) {
                res.set('Retry-After', String(error.retryAfterSeconds));
            }
            return res.status(429).json({
                error: 'Grok API global rate limit reached',
                details: `${GROQ_GLOBAL_LIMIT} requests/hour shared across all users. Please retry later.`
            });
        }
        res.status(500).json({
            error: 'Failed to generate quiz',
            details: error.response?.data || error.message
        });
    }
});

// Generate subjective questions for a specific lesson
router.post('/:id/lessons/:lessonIndex/subjective', authenticateToken, async (req, res) => {
    try {
        const { count } = req.body || {};
        const requestedCount = Math.min(Math.max(parseInt(count, 10) || 5, 3), 12);
        const lessonIndex = parseInt(req.params.lessonIndex, 10);

        if (Number.isNaN(lessonIndex) || lessonIndex < 0) {
            return res.status(400).json({ error: 'Invalid lesson index' });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
        }

        const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const lesson = course.lessons?.[lessonIndex];
        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const rawContent = typeof lesson.content === 'string' ? lesson.content : JSON.stringify(lesson.content || {});
        const trimmedContent = rawContent.length > 4200 ? `${rawContent.slice(0, 4200)}\n\n[Content truncated]` : rawContent;
        const keyPoints = Array.isArray(lesson.keyPoints) ? lesson.keyPoints.slice(0, 5) : [];

        const prompt = `Create ${requestedCount} subjective (open-ended) questions for the lesson below.

Lesson Title: ${lesson.title || 'Lesson'}
Key Points: ${keyPoints.join(' | ') || 'N/A'}
Lesson Content (truncated if long):
${trimmedContent}

Return ONLY valid JSON that matches this schema exactly. No markdown fences. No extra keys.
{
  "questions": [
    {
      "question": string,
      "expectedAnswer": string,
      "keyPoints": [string, string, string]
    }
  ]
}

Rules:
- Questions must test understanding, reasoning, and explanation, not one-word recall.
- "expectedAnswer" should be concise and practical (3-6 lines).
- "keyPoints" should include 3 to 5 short bullet-style strings.
- Keep each question grounded in lesson content.`;

        const response = await callGroqChatCompletions(
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a strict JSON generator. Output ONLY valid JSON that exactly matches the provided schema.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.5,
                max_tokens: 2200
            },
            process.env.GROQ_API_KEY
        );

        const responseContent = response.data.choices[0].message.content;
        const cleaned = responseContent
            .replace(/```json\n?/gi, '')
            .replace(/```\n?/g, '')
            .trim();

        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace === -1 || lastBrace === -1) {
            return res.status(500).json({ error: 'Invalid subjective response format' });
        }

        let parsed;
        try {
            parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
        } catch (parseError) {
            console.error('Subjective JSON Parse Error:', parseError);
            return res.status(500).json({ error: 'Failed to parse subjective response' });
        }

        const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
        const normalized = questions
            .filter((q) => q && typeof q.question === 'string')
            .map((q) => ({
                question: q.question.trim(),
                expectedAnswer: typeof q.expectedAnswer === 'string' && q.expectedAnswer.trim()
                    ? q.expectedAnswer.trim()
                    : 'No expected answer provided.',
                keyPoints: Array.isArray(q.keyPoints)
                    ? q.keyPoints.filter((point) => typeof point === 'string').slice(0, 5)
                    : []
            }));

        res.json({ questions: normalized.slice(0, requestedCount) });
    } catch (error) {
        console.error('Error generating subjective questions:', error.response?.data || error.message);
        if (error.code === 'GROQ_GLOBAL_RATE_LIMIT_EXCEEDED') {
            if (error.retryAfterSeconds) {
                res.set('Retry-After', String(error.retryAfterSeconds));
            }
            return res.status(429).json({
                error: 'Grok API global rate limit reached',
                details: `${GROQ_GLOBAL_LIMIT} requests/hour shared across all users. Please retry later.`
            });
        }
        res.status(500).json({
            error: 'Failed to generate subjective questions',
            details: error.response?.data || error.message
        });
    }
});

// Submit quiz results for a specific lesson
router.post('/:id/lessons/:lessonIndex/quiz/submit', authenticateToken, async (req, res) => {
    try {
        const lessonIndex = parseInt(req.params.lessonIndex, 10);
        if (Number.isNaN(lessonIndex) || lessonIndex < 0) {
            return res.status(400).json({ error: 'Invalid lesson index' });
        }

        const { score, total, incorrectQuestions } = req.body || {};
        const safeScore = Math.max(0, parseInt(score, 10) || 0);
        const safeTotal = Math.max(0, parseInt(total, 10) || 0);
        const incorrect = Array.isArray(incorrectQuestions) ? incorrectQuestions : [];

        const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!course.lessons?.[lessonIndex]) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        const normalizedIncorrect = incorrect
            .filter((q) => q && typeof q.question === 'string')
            .map((q) => ({
                question: q.question.trim(),
                correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
                selectedAnswer: Number.isInteger(q.selectedAnswer) ? q.selectedAnswer : -1,
                explanation: typeof q.explanation === 'string' ? q.explanation.trim() : ''
            }));

        const weakPoints = normalizedIncorrect.map((q) => q.question).slice(0, 10);

        course.lessons[lessonIndex].quizProgress = {
            completed: true,
            score: safeScore,
            total: safeTotal,
            weakPoints,
            incorrect: normalizedIncorrect,
            completedAt: new Date()
        };

        await course.save();
        res.json({ success: true, quizProgress: course.lessons[lessonIndex].quizProgress });
    } catch (error) {
        console.error('Error saving quiz results:', error);
        res.status(500).json({ error: 'Failed to save quiz results' });
    }
});

// Get all courses for the current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const courses = await Course.find({ userId: req.user.id })
            .select('courseTitle topic lessons createdAt views')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

// Get specific course by ID (current user only)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, userId: req.user.id });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Increment views
        course.views += 1;
        await course.save();

        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
});

// Delete specific course by ID (current user only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Failed to delete course' });
    }
});

export default router;
