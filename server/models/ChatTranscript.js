const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatTranscriptSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    default: 'anonymous' // Will be replaced with actual user ID in the future
  },
  messages: [messageSchema],
  summary: {
    type: String,
    default: ''
  },
  aiAnalysis: {
    keyTopics: [String],
    comprehensionLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    engagementScore: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    suggestedFocusAreas: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatTranscriptSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ChatTranscript', chatTranscriptSchema); 