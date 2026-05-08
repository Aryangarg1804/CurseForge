import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  lessons: [{
    title: String,
    content: String,
    keyPoints: [String],
    quiz: [{
      question: String,
      options: [String],
      answer: String
    }],
    quizProgress: {
      completed: { type: Boolean, default: false },
      score: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      weakPoints: [String],
      incorrect: [{
        question: String,
        correctAnswer: Number,
        selectedAnswer: Number,
        explanation: String
      }],
      completedAt: Date
    },
    assignment: String
  }],
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Course', CourseSchema);
