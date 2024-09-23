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
    destination: '../uploads/',  // Directory to store uploaded PDF files
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Ensure unique filenames
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
        const { question, pdfContent } = req.body;

        if (!vectorStore) {
            return res.status(400).json({ error: 'No PDF content processed yet. Please upload a PDF first.' });
        }

        // Use the in-memory vector store for document retrieval
        const retriever = vectorStore.asRetriever();
        const retrievedDocs = await retriever.getRelevantDocuments(question);

        console.log("Retrieved documents:", retrievedDocs);

        // Generate context summary from the retrieved documents
        const contextSummary = `
        The PDF content covers the following topics:
        ${pdfContent}

        The user asked: "${question}". Please provide a detailed response.
        `;

        console.log("GPT-4 Prompt with context:", contextSummary);

        // Make a request to OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4",  // You can replace with other models like "gpt-4-turbo" if available
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: contextSummary }
            ],
        });

        // Log and send the GPT-4 response
        console.log("GPT-4 Response:", completion.choices[0].message.content);
        res.json({ response: completion.choices[0].message.content });

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

// Handle course creation with PDF upload
router.post('/courses', upload.single('pdf'), async (req, res) => {
    try {
        const { title, instructor, duration, level, category, description } = req.body;
        const pdfPath = req.file ? req.file.path : null;

        // Create and save the course
        const course = new Course({
            title,
            instructor,
            duration,
            level,
            category,
            description,
            pdfPath  // Store the path to the uploaded PDF
        });

        await course.save();

        // If a PDF was uploaded, process it using the existing PDF logic
        if (pdfPath) {
            const loader = new PDFLoader(pdfPath);
            const docs = await loader.load();

            // Split the PDF content into smaller chunks
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const splits = await textSplitter.splitDocuments(docs);

            console.log("Extracted PDF chunks:", splits.map(chunk => chunk.pageContent));

            // Create embeddings and store documents in an in-memory vector store
            const embeddings = new OpenAIEmbeddings({
                model: "text-embedding-ada-002",
                apiKey: process.env.OPENAI_API_KEY,
                batchSize: 512,
            });

            // Create a MemoryVectorStore from documents using embeddings
            vectorStore = await MemoryVectorStore.fromDocuments(splits, embeddings);

            // Cleanup uploaded PDF file after processing
            await fs.unlink(pdfPath);
        }

        res.status(201).json({ message: 'Course created and PDF processed successfully', course });
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({ error: err.message });
    }
});

// Retrieve PDF content for a specific course
router.get('/courses-pdf/:courseId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course || !course.pdfPath) {
            return res.status(404).json({ error: 'Course or PDF not found' });
        }

        // Read the PDF content
        const pdfPath = course.pdfPath;
        const loader = new PDFLoader(pdfPath);
        const pdfDocs = await loader.load();

        // Return the raw text content of the PDF to be used by the AI Tutor
        res.json(pdfDocs.map(doc => doc.pageContent).join(' '));
    } catch (error) {
        res.status(500).json({ error: 'Error fetching course PDF' });
    }
});


module.exports = router;
