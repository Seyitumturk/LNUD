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

// Multer setup to handle file uploads
const storage = multer.diskStorage({
    destination: './uploads/',  // Directory to store uploaded PDF files
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Ensure unique filenames
    }
});
const upload = multer({ storage });

// Global vectorStore variable
let vectorStore = null;

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
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
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

        console.log("Retrieved documents:", retrievedDocs);

        // Use GPT-4 to generate a response based on the retrieved documents
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Generate context summary from the retrieved documents
        const contextSummary = `
        This document covers the following topics:
        ${retrievedDocs.map(doc => doc.pageContent).join('\n\n')}

        The user asked: "${question}". Please provide a detailed response.
        `;

        console.log("GPT-4 Prompt with context:", contextSummary);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: contextSummary }
            ]
        });

        // Log and send the GPT-4 response
        console.log("GPT-4 Response:", response);
        res.json({ response: response.choices[0].message.content });

    } catch (error) {
        console.error('Error with AI Tutor:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
