const express = require('express');
const router = express.Router();
const OpenAI = require("openai");
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs').promises;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ dest: 'uploads/' });

// Mock function to get presentation content (keep this for non-PDF content)
async function getPresentationContent(id) {
    return `This is the content of presentation ${id}. It includes key points about the topic.`;
}

router.get('/presentation-content/:id', async (req, res) => {
    try {
        const content = await getPresentationContent(req.params.id);
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching presentation content' });
    }
});

router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    console.log('Received file upload request');
    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        console.log('File uploaded:', req.file.path);
        const dataBuffer = await fs.readFile(req.file.path);
        console.log('File read successfully');
        const data = await pdf(dataBuffer);
        console.log('PDF parsed successfully');
        await fs.unlink(req.file.path);
        console.log('Temporary file deleted');

        res.json({ content: data.text });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: 'Error processing PDF: ' + error.message });
    }
});

router.post('/ai-tutor', async (req, res) => {
    try {
        const { question, presentationContent } = req.body;

        if (!question || !presentationContent) {
            return res.status(400).json({ error: 'Missing question or presentation content' });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful AI tutor. Use the following presentation content to answer the user's question." },
                { role: "user", content: `Presentation content: ${presentationContent}\n\nQuestion: ${question}` }
            ],
        });

        if (!completion.choices || completion.choices.length === 0) {
            return res.status(500).json({ error: 'Invalid response from OpenAI' });
        }

        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error in AI tutor:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error getting AI response', details: error.message });
    }
});

module.exports = router;