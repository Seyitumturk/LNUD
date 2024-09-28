const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const OpenAI = require('openai'); // Import OpenAI directly
const axios = require('axios');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const Course = require('../models/Course'); // Assuming the course model is in a models directory
const qs = require('qs');

// Multer setup to handle file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Global vectorStore variable
let vectorStore = null;

// OpenAI configuration (ensure you have your OpenAI API key in the environment variables)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Replace with your API key
});

const datasetListApiUrl = 'https://open.canada.ca/data/en/api/3/action/group_list'; // URL to fetch the list of datasets

// Replace these with your Client ID and Secret
const CLIENT_ID = 'd6a13406-b3c8-4cb5-8d25-191bbe9191a1';
const CLIENT_SECRET = 'm2RwOgBHTCgqiaDzutuiksAf8EpySx2H';
const TOKEN_URL = 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token';
const PROCESS_URL = 'https://services.sentinel-hub.com/api/v1/process';

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
        const { question, screenshot } = req.body;

        console.log(`Received question: ${question}`);

        // Log the received screenshot data to ensure it's passed correctly
        if (screenshot) {
            console.log(`Received screenshot data (length): ${screenshot.length}`);
        } else {
            console.log('No screenshot data received.');
        }

        if (!vectorStore) {
            return res.status(400).json({ error: 'No PDF content processed yet. Please upload a PDF first.' });
        }

        let visionAnalysis = '';
        if (screenshot) {
            try {
                console.log('Sending screenshot to GPT-4 Vision API...');

                const visionResponse = await openai.chat.completions.create({
                    model: 'gpt-4o',  // Use the vision-capable model
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that can analyze both text and images.' },
                        { role: 'user', content: question, image: screenshot }  // Include the screenshot in the request
                    ]
                });

                console.log('Vision API Response:', visionResponse);

                // Extract the text or analysis from the vision API response
                visionAnalysis = visionResponse.choices[0]?.message?.content || 'No analysis available for the screenshot';
                console.log(`Extracted vision analysis: ${visionAnalysis}`);
            } catch (visionError) {
                console.error('Error analyzing screenshot with GPT-4 Vision API:', visionError.message);
                return res.status(500).json({ error: 'Error processing the screenshot with GPT-4 Vision API.' });
            }
        }

        res.json({ response: visionAnalysis });
    } catch (error) {
        console.error('Error with AI Tutor:', error.message);
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

        // Create and save the course, including the Canva link and PDF path
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

            // Create embeddings and store documents in the in-memory vector store
            const embeddings = new OpenAIEmbeddings({
                model: "text-embedding-ada-002",  // Choose a suitable model
                apiKey: process.env.OPENAI_API_KEY,
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
