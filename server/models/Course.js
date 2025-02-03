const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    pdfPath: {
        type: String,
        required: true,
        get: function(filename) {
            return filename ? `/uploads/pdfs/${filename}` : null;
        }
    },
    pptxPath: {
        type: String
    },
    canvaLink: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
