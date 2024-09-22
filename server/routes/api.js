const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');  // Correct path
const { OpenAIEmbeddings } = require('@langchain/openai');
const { RetrievalQAChain } = require('langchain/chains');
const { OpenAI } = require('@langchain/openai');
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

        // Create embeddings and store documents in an in-memory vector store
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-ada-002",
            apiKey: process.env.OPENAI_API_KEY
        });
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

        // Use the in-memory vector store for retrieval-based QA
        const retriever = vectorStore.asRetriever();

        // Create a RetrievalQA chain
        const chain = RetrievalQAChain.fromLLM(
            new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
            retriever
        );
        const response = await chain.call({ query: question });

        res.json({ response: response.text });
    } catch (error) {
        console.error('Error with AI Tutor:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;