const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    instructor: { type: String, required: true },
    duration: { type: String, required: true },
    level: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    pdfPath: { type: String },  // PDF file path if needed
    canvaLink: { type: String },  // Canva presentation link
    featured: { type: Boolean, default: false },
    bgImage: { type: String },  // Background image URL
    progress: { type: Number }  // Optional progress tracking for enrolled students
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
