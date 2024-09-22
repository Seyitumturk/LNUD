const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { OpenAI } = require('openai'); // Ensure correct import from the latest OpenAI package
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');

// Multer setup to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Define a global variable for vectorStore
let vectorStore = null;

// Handle PDF upload and processing
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const loader = new PDFLoader(filePath);
        const docs = await loader.load();

        // Split the PDF into smaller chunks
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

        // Cleanup uploaded PDF file
        await fs.unlink(filePath);

        res.json({ message: 'PDF processed and documents added to the in-memory vector store successfully.' });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle AI tutor questions
router.post('/ai-tutor', async (req, res) => {
    try {
        const { question } = req.body;

        if (!vectorStore) {
            return res.status(400).json({ error: 'Vector store is not initialized. Please upload a PDF first.' });
        }

        // Use the in-memory vector store for retrieval
        const retriever = vectorStore.asRetriever();

        // Retrieve relevant documents from the vector store
        const retrievedDocs = await retriever.getRelevantDocuments(question);

        console.log("Retrieved documents:", retrievedDocs);

        // Use GPT-4 for the actual response generation
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Construct a context from retrieved documents to give GPT-4 more relevant info
        const contextSummary = `
        This document covers the following topics:
        ${retrievedDocs.map(doc => doc.pageContent).join('\n\n')}

        Based on the context above, the user asked: "${question}". Please provide a detailed response.
        `;

        console.log("GPT-4 Prompt with context:", contextSummary);

        // Use GPT-4 to generate a response
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: contextSummary }
            ]
        });

        // Log and send the GPT-4 response back
        console.log("GPT-4 Response:", response);
        res.json({ response: response.choices[0].message.content });

    } catch (error) {
        console.error('Error with AI Tutor:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
