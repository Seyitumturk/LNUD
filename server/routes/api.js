const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const Course = require('../models/Course');  // Assuming the course model is in a models directory
const path = require('path');
const OpenAI = require('openai'); // Import OpenAI directly

// Multer setup to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        console.log('Saving file to:', uploadPath);  // Debug log to confirm the path
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        console.log('Generated filename:', uniqueName);  // Debug log to confirm the filename
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Global vectorStore variable
let vectorStore = null;

// OpenAI configuration (ensure you have your OpenAI API key in the environment variables)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,  // Replace with your API key
});

// Handle AI tutor queries
router.post('/ai-tutor', async (req, res) => {
    try {
        const { question } = req.body;

        if (!vectorStore) {
            return res.status(400).json({ error: 'No PDF content processed yet. Please upload a PDF first.' });
        }

        // Use the in-memory vector store for document retrieval
        const retriever = vectorStore.asRetriever();
        const retrievedDocs = await retriever.getRelevantDocuments(question);

        console.log('Retrieved documents:', retrievedDocs);

        // Generate context summary from the retrieved documents
        const contextSummary = `
        The retrieved content is as follows:
        ${retrievedDocs.map(doc => doc.pageContent).join('\n\n')}

        The user asked: "${question}". Please provide a detailed response.
        `;

        console.log('GPT-4 Prompt with context:', contextSummary);

        // Make a request to OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: contextSummary },
            ],
        });

        // Log and send the GPT-4 response
        console.log('GPT-4 Response:', completion.choices[0]?.message?.content);  // Use optional chaining
        res.json({ response: completion.choices[0]?.message?.content || 'No response available from GPT-4' });
    } catch (error) {
        console.error('Error with AI Tutor:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add this route to handle fetching all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find(); // Fetch all courses from the database
        res.json(courses); // Return the courses as a JSON response
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Error fetching courses' });
    }
});

// Handle course creation with PDF upload and process the PDF content
router.post('/courses', upload.single('pdf'), async (req, res) => {
    try {
        const { title, instructor, duration, level, category, description, canvaLink } = req.body;

        const pdfPath = req.file ? req.file.path : null;

        console.log('Uploaded file path:', pdfPath);  // Debug log for the file path

        // Create and save the course, including the Canva link
        const course = new Course({
            title,
            instructor,
            duration,
            level,
            category,
            description,
            pdfPath,  // Save the PDF path if uploaded
            canvaLink  // Save the Canva link
        });

        await course.save();

        // Process the PDF after saving the course
        if (pdfPath) {
            const loader = new PDFLoader(pdfPath);
            const docs = await loader.load();

            // Split the PDF content into smaller chunks
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,  // Size of each chunk
                chunkOverlap: 200,  // Overlap between chunks
            });
            const splits = await textSplitter.splitDocuments(docs);

            console.log('Extracted PDF chunks:', splits.map(chunk => chunk.pageContent));

            // Create embeddings and store documents in the in-memory vector store
            const embeddings = new OpenAIEmbeddings({
                model: "text-embedding-3-large",
                apiKey: process.env.OPENAI_API_KEY,
                batchSize: 512,
            });

            // Create a MemoryVectorStore from documents using embeddings
            vectorStore = await MemoryVectorStore.fromDocuments(splits, embeddings);

            console.log('VectorStore initialized and ready for queries');
        }

        res.status(201).json({ message: 'Course created and PDF processed successfully', course });
    } catch (err) {
        console.error('Error uploading PDF and creating course:', err);
        res.status(500).json({ error: 'Error uploading PDF and creating course' });
    }
});

// Retrieve PDF content for a specific course
router.get('/courses-pdf/:courseId', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        console.log(`Fetching PDF for courseId: ${courseId}`);

        const course = await Course.findById(courseId);
        if (!course) {
            console.error('Course not found');
            return res.status(404).json({ error: 'Course not found' });
        }

        if (!course.pdfPath) {
            console.error('No PDF path found for this course');
            return res.status(404).json({ error: 'PDF not found for this course' });
        }

        const pdfPath = course.pdfPath;
        console.log(`Loading PDF from path: ${pdfPath}`);

        const loader = new PDFLoader(pdfPath);
        const pdfDocs = await loader.load();
        const pdfContent = pdfDocs.map(doc => doc.pageContent).join(' ');

        console.log('Successfully loaded PDF content');
        res.json(pdfContent);  // Send the raw text content of the PDF
    } catch (error) {
        console.error('Error fetching course PDF:', error);
        res.status(500).json({ error: 'Error fetching course PDF' });
    }
});

// Add a route to fetch a specific course by ID
router.get('/courses/:courseId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ error: 'Error fetching course' });
    }
});

module.exports = router;
