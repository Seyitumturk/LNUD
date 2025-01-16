const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const Course = require('../models/Course');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { ChatOpenAI } = require('@langchain/openai');
const { RetrievalQAChain } = require('langchain/chains');
const { Document } = require('@langchain/core/documents');
const { FaissStore } = require('@langchain/community/vectorstores/faiss');
const { ConversationSummaryMemory } = require('langchain/memory');
const { MessagesPlaceholder } = require('@langchain/core/prompts');
const { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence, RunnablePassthrough } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { BufferMemory } = require('langchain/memory');
const { ChatMessageHistory } = require('langchain/stores/message/in_memory');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Use the uploadDir constant
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Global vectorStore variable
let vectorStore = null;

// Update OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Replace with your API key
});

const datasetListApiUrl = 'https://open.canada.ca/data/en/api/3/action/group_list'; // URL to fetch the list of datasets

// Replace these with your Client ID and Secret
const CLIENT_ID = 'd6a13406-b3c8-4cb5-8d25-191bbe9191a1';
const CLIENT_SECRET = 'm2RwOgBHTCgqiaDzutuiksAf8EpySx2H';
const TOKEN_URL = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token';
const PROCESS_URL = 'https://services.sentinel-hub.com/api/v1/process';

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
});

// Store vector stores for each course
const courseVectorStores = new Map();

// Update the chat histories Map to use ConversationSummaryBufferMemory
const chatMemories = new Map();

// Add this near other global variables
const messageStore = new Map();

// Function to process PDF content and create vector store
async function processAndStorePDFContent(courseId, pdfContent) {
    try {
        console.log(`Processing PDF content for course ${courseId}`);
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

        console.log('Splitting documents...');
    const docs = await textSplitter.splitDocuments([
        new Document({ pageContent: pdfContent })
    ]);
        console.log(`Created ${docs.length} document chunks`);
    
        console.log('Creating vector store...');
    const vectorStore = await FaissStore.fromDocuments(
        docs, 
            new OpenAIEmbeddings({ 
                openAIApiKey: process.env.OPENAI_API_KEY,
                modelName: 'text-embedding-3-small' // Using latest embedding model
            })
    );
        console.log('Vector store created successfully');
        
    courseVectorStores.set(courseId, vectorStore);
        return vectorStore;
    } catch (error) {
        console.error('Error in processAndStorePDFContent:', error);
        throw error;
    }
}

// Endpoint to fetch the Sentinel Hub map image
router.post('/sentinel-image', async (req, res) => {
    console.log("Sentinel Image Request Initiated");
    try {
        // Step 1: Obtain access token using client credentials
        const tokenResponse = await axios.post(
            TOKEN_URL,
            qs.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'client_credentials',
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        // Step 2: Define request payload
        const requestBody = {
            input: {
                bounds: {
                    properties: {
                        crs: 'http://www.opengis.net/def/crs/OGC/1.3/CRS84'  // CRS specification is crucial
                    },
                    bbox: [13.822174072265625, 45.85080395917834, 14.55963134765625, 46.29191774991382]  // Example bbox coordinates
                },
                data: [{
                    type: 'sentinel-2-l2a',  // Dataset type for Sentinel-2 L2A
                    dataFilter: {
                        timeRange: {
                            from: '2020-06-01T00:00:00Z',
                            to: '2020-06-30T23:59:59Z'  // Specific time range
                        },
                        maxCloudCoverage: 20  // Set maximum cloud coverage to filter images
                    },
                }],
            },
            output: {
                width: 512,
                height: 512,
                responses: [
                    {
                        identifier: 'default',
                        format: {
                            type: 'image/jpeg'  // JPEG format for the output image
                        }
                    }
                ]
            },
            evalscript: `
                //VERSION=3
                function setup() {
                    return {
                        input: ["B02", "B03", "B04"],
                        output: { bands: 3, sampleType: "AUTO" }  // Setting bands and sampleType for output
                    };
                }

                function evaluatePixel(sample) {
                    return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];  // Define RGB values
                }
            `,
        };

        // Step 3: Make API request to the Sentinel Hub Process API
        const imageResponse = await axios.post(PROCESS_URL, requestBody, {
            headers: {
                Authorization: `Bearer ${accessToken}`,  // Bearer token for authorization
                'Content-Type': 'application/json',
                Accept: 'image/jpeg'  // Set response type to JPEG
            },
            responseType: 'arraybuffer',  // Handle binary data
        });

        // Step 4: Encode image to base64 and send response
        const imageBase64 = Buffer.from(imageResponse.data, 'binary').toString('base64');
        res.send({ image: `data:image/jpeg;base64,${imageBase64}` });
    } catch (error) {
        // Capture and log errors during request
        console.error('Error fetching image:', error.message, error.response ? error.response.data : '');
        res.status(500).send({ error: 'Failed to fetch image' });
    }
});


// Function to fetch the list of all datasets from the CKAN API
const fetchAllDatasets = async () => {
    try {
        // Make a GET request to the group_list endpoint to retrieve all datasets
        const response = await axios.post(datasetListApiUrl, {});

        // Return the list of dataset names if the response is successful
        if (response.data && response.data.result) {
            return response.data.result;
        } else {
            throw new Error('Failed to fetch dataset list');
        }
    } catch (error) {
        console.error('Error fetching dataset list:', error.response ? error.response.data : error.message);
        throw new Error('Unable to fetch dataset list');
    }
};

// Define a new API endpoint to get the list of all available datasets
router.get('/datasets', async (req, res) => {
    try {
        // Fetch all datasets
        const datasets = await fetchAllDatasets();

        // Respond with the dataset list
        res.json(datasets);
    } catch (error) {
        console.error('Error in /datasets route:', error.message);
        res.status(500).json({ error: 'Unable to fetch dataset list' });
    }
});

// Handle AI tutor queries
router.post('/ai-tutor', async (req, res) => {
    try {
        const { question, courseId, isInitialGreeting, sessionId } = req.body;
        
        if (!courseId) {
            return res.status(400).json({ error: 'courseId is required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Get or initialize message history
        if (!messageStore.has(sessionId)) {
            messageStore.set(sessionId, new ChatMessageHistory());
        }
        const messageHistory = messageStore.get(sessionId);

        // For initial greeting or when no PDF is available
        if (isInitialGreeting || !course.pdfPath) {
            const chat = new ChatOpenAI({ 
                    modelName: "gpt-4o-mini",
                    temperature: 0.7 
            });

            const response = await chat.call([
                { role: "system", content: `You are Pipi, a friendly and enthusiastic AI tutor for "${course.title}".` },
                ...(await messageHistory.getMessages()),
                { role: "user", content: question }
            ]);

            // Save messages to history
            await messageHistory.addMessage(new HumanMessage(question));
            await messageHistory.addMessage(new AIMessage(response.content));

            return res.json({ 
                response: response.content,
                sessionId: sessionId 
            });
        }

        // Use RAG with chat history for document-based responses
        let vectorStore = courseVectorStores.get(courseId);
        
        if (!vectorStore && course.pdfPath) {
            const loader = new PDFLoader(course.pdfPath);
            const pdfDocs = await loader.load();
            const pdfContent = pdfDocs.map(doc => doc.pageContent).join(' ');
            await processAndStorePDFContent(courseId, pdfContent);
            vectorStore = courseVectorStores.get(courseId);
        }

        // Create contextual question prompt
        const contextualQuestionPrompt = ChatPromptTemplate.fromMessages([
            ["system", `Given the chat history and the latest question, formulate a standalone question 
                       that captures the full context. If the question is already standalone, return it as is.`],
            new MessagesPlaceholder("chat_history"),
            ["human", "{question}"]
        ]);

        // Create answer prompt
        const answerPrompt = ChatPromptTemplate.fromMessages([
            ["system", `You are Pipi, a friendly and enthusiastic AI tutor for "${course.title}". 
                Use the following context to answer the question: {context}
                
                Format your response using these markers:
                - Use **text** for important concepts, terms, or key points
                - Use __text__ for definitions or crucial explanations
                Be natural with the formatting - don't overuse it.`],
            new MessagesPlaceholder("chat_history"),
            ["human", "{question}"]
        ]);

        // Create the chain
        const chain = RunnableSequence.from([
            {
                // Get standalone question
                standaloneQuestion: RunnableSequence.from([
                    {
                        question: (input) => input.question,
                        chat_history: async () => await messageHistory.getMessages()
                    },
                    contextualQuestionPrompt,
                    new ChatOpenAI({ temperature: 0 }),
                    new StringOutputParser()
                ]),
                // Pass through original input
                originalInput: input => input
            },
            {
                // Get relevant documents
                context: async (input) => {
                    const docs = await vectorStore.asRetriever().getRelevantDocuments(input.standaloneQuestion);
                    return docs.map(doc => doc.pageContent).join('\n');
                },
                question: input => input.originalInput.question,
                chat_history: async () => await messageHistory.getMessages()
            },
            answerPrompt,
            new ChatOpenAI({ temperature: 0.7 }),
            new StringOutputParser()
        ]);

        // Execute chain
        const response = await chain.invoke({
            question: question
        });

        // Save to history
        await messageHistory.addMessage(new HumanMessage(question));
        await messageHistory.addMessage(new AIMessage(response));

        res.json({ 
            response: response,
            sessionId: sessionId 
        });

    } catch (error) {
        console.error('Error in AI Tutor endpoint:', error);
        res.status(500).json({ 
            error: 'Error processing request', 
            details: error.message 
        });
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

        console.log('Received file:', req.file);
        const pdfPath = req.file ? path.resolve(req.file.path) : null; // Use absolute path

        // Create and save the course
        const course = new Course({
            title,
            instructor,
            duration,
            level,
            category,
            description,
            pdfPath, // Make sure this is being saved correctly
            canvaLink
        });

        const savedCourse = await course.save();
        console.log('Course saved with PDF path:', savedCourse.pdfPath);

        res.status(201).json({ message: 'Course created successfully', course: savedCourse });
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({ 
            error: 'Error creating course', 
            details: err.message 
        });
    }
});
// Retrieve PDF content for a specific course
router.get('/courses-pdf/:courseId', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        if (!course.pdfPath) return res.status(404).json({ error: 'PDF not found for this course' });

        const pdfPath = course.pdfPath;
        const loader = new PDFLoader(pdfPath);
        const pdfDocs = await loader.load();
        const pdfContent = pdfDocs.map(doc => doc.pageContent).join(' ');

        res.json({ pdfContent });  // Send the raw text content of the PDF
    } catch (error) {
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
