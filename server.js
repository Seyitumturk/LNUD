//IMPORTS 
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs'); // Import ExcelJS
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors'); // Import CORS
const OpenAI = require('openai'); // Import OpenAI directly
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Your OpenAI API key from .env
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lnud-db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Basic route
app.get('/api', (req, res) => {
    res.send('Hello World!');
});

// ENDPOINTS 


const jsonSchema = {
    type: 'object',
    properties: {
        categories: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    category: { type: 'string' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                itemId: { type: 'string' },
                                itemName: { type: 'string' },
                                quantity: { type: 'number' },
                                location: { type: 'string' },
                            },
                            required: ['itemId', 'itemName'],
                        },
                    },
                },
                required: ['category', 'items'],
            },
        },
    },
    required: ['categories'],
};

// Route to organize inventory data using GPT-4o
app.post('/api/organize-inventory', async (req, res) => {
    const { inventoryData } = req.body; // Receive inventory data from the client

    try {
        // Construct the prompt for GPT-4o
        const prompt = `
      You are an expert in inventory management. Organize the following items into categories based on their descriptions or properties. Ensure the output adheres to the following JSON schema:
      
      ${JSON.stringify(jsonSchema)}
  
      Here are the inventory items:
      ${JSON.stringify(inventoryData)}
      `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-2024-08-06', // Use the GPT-4o model
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
        });

        // Ensure only the JSON output is parsed
        let organizedData;
        try {
            organizedData = JSON.parse(response.choices[0].message.content);
        } catch (error) {
            console.error('Error parsing JSON from GPT-4o response:', error);
            return res.status(500).send('Invalid JSON received from GPT-4o.');
        }

        res.json(organizedData); // Send organized data back to the client
    } catch (error) {
        console.error('Error organizing inventory data with GPT-4o:', error);
        res.status(500).send('Error organizing inventory data.');
    }
});
// Route to edit Excel file (existing logic)
app.post('/api/edit-excel', async (req, res) => {
    const {
        dateSubmitted,
        productDescription,
        fundingStream,
        sourceGrant,
        account,
        purchasedWith,
        quantity,
        costPerUnit,
    } = req.body;

    console.log('Received Data:', {
        dateSubmitted,
        productDescription,
        fundingStream,
        sourceGrant,
        account,
        purchasedWith,
        quantity,
        costPerUnit,
    });

    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'files', 'PurchaseOrder.xlsx'); // Path to your Excel file

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet('Purchase Order');

        // Ensure each cell is updated correctly
        worksheet.getCell('B6').value = dateSubmitted;           // Date Submitted field
        worksheet.getCell('B12').value = productDescription;     // Product Description
        worksheet.getCell('C12').value = fundingStream;          // Funding Stream (Dropdown)
        worksheet.getCell('D12').value = sourceGrant;            // Source / Grant (Dropdown)
        worksheet.getCell('E12').value = account;                // Account (First part of merged cell)
        worksheet.getCell('F12').value = account;                // Account (Second part of merged cell)
        worksheet.getCell('G12').value = purchasedWith;          // Purchased With
        worksheet.getCell('H12').value = quantity;               // QTY
        worksheet.getCell('I12').value = costPerUnit;            // Cost per Unit

        const modifiedFilePath = path.join(__dirname, 'files', 'ModifiedPurchaseOrder.xlsx');
        await workbook.xlsx.writeFile(modifiedFilePath);

        // Send the modified file as a download
        res.download(modifiedFilePath, 'ModifiedPurchaseOrder.xlsx', (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).send('Error downloading file');
            }
        });
    } catch (error) {
        console.error('Error writing to Excel cells:', error);
        res.status(500).send('Error writing to Excel file.');
    }
});

// Route to get inventory data (preserved and improved)
app.get('/api/get-inventory', async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'files', 'InventoryTemplate.xlsx'); // Path to your inventory Excel file

    try {
        console.log('Reading Excel file from:', filePath); // Debugging log
        await workbook.xlsx.readFile(filePath); // Attempt to read the file
        const worksheet = workbook.getWorksheet('Sheet1'); // Use "Sheet1" instead of "Inventory"

        if (!worksheet) {
            console.error('Worksheet named "Sheet1" not found in Excel file.'); // Debugging log
            return res.status(404).send('Worksheet named "Sheet1" not found in Excel file.');
        }

        const inventoryData = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                inventoryData.push({
                    itemId: row.getCell('A').value,
                    itemName: row.getCell('B').value,
                    quantity: row.getCell('C').value,
                    location: row.getCell('D').value,
                });
            }
        });

        console.log('Sending inventory data:', inventoryData); // Debugging log
        res.json(inventoryData); // Send JSON response
    } catch (error) {
        console.error('Error reading inventory Excel file:', error);
        res.status(500).send('Error reading inventory Excel file.');
    }
});


// Route to manage inventory in Excel file
app.post('/api/manage-inventory', async (req, res) => {
    const { action, itemId, itemName, quantity, location } = req.body;

    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'files', 'InventoryTemplate.xlsx');

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet('Sheet1'); // Use "Sheet1" instead of "Inventory"

        if (!worksheet) {
            return res.status(404).send('Worksheet named "Sheet1" not found in Excel file.');
        }

        if (action === 'add') {
            const lastRow = worksheet.lastRow;
            const nextRow = worksheet.getRow(lastRow.number + 1);
            nextRow.getCell('A').value = itemId;
            nextRow.getCell('B').value = itemName;
            nextRow.getCell('C').value = quantity;
            nextRow.getCell('D').value = location;
            nextRow.commit();
        } else if (action === 'export') {
            // Implement export logic if needed
        }

        const modifiedFilePath = path.join(__dirname, 'files', 'UpdatedInventory.xlsx');
        await workbook.xlsx.writeFile(modifiedFilePath);

        res.download(modifiedFilePath, 'UpdatedInventory.xlsx', (err) => {
            if (err) {
                console.error('Error downloading inventory file:', err);
                res.status(500).send('Error downloading inventory file');
            }
        });
    } catch (error) {
        console.error('Error managing inventory in Excel:', error);
        res.status(500).send('Error managing inventory in Excel.');
    }
});

// Route to manage inventory in Excel file (preserved and improved)
app.post('/api/manage-inventory', async (req, res) => {
    const { action, itemId, itemName, quantity, location } = req.body;

    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'files', 'InventoryTemplate.xlsx');

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet('Inventory');

        if (!worksheet) {
            return res.status(404).send('Worksheet named "Inventory" not found in Excel file.');
        }

        if (action === 'add') {
            const lastRow = worksheet.lastRow;
            const nextRow = worksheet.getRow(lastRow.number + 1);
            nextRow.getCell('A').value = itemId;
            nextRow.getCell('B').value = itemName;
            nextRow.getCell('C').value = quantity;
            nextRow.getCell('D').value = location;
            nextRow.commit();
        } else if (action === 'export') {
            // Implement export logic if needed
        }

        const modifiedFilePath = path.join(__dirname, 'files', 'UpdatedInventory.xlsx');
        await workbook.xlsx.writeFile(modifiedFilePath);

        res.download(modifiedFilePath, 'UpdatedInventory.xlsx', (err) => {
            if (err) {
                console.error('Error downloading inventory file:', err);
                res.status(500).send('Error downloading inventory file');
            }
        });
    } catch (error) {
        console.error('Error managing inventory in Excel:', error);
        res.status(500).send('Error managing inventory in Excel.');
    }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
