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

// Update this line to correctly import the api routes
const apiRoutes = require('./server/routes/api');

// Middleware
app.use(cors({
    origin: 'http://localhost:3000' // Replace with your React app's URL
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/lnud-db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Basic route
app.get('/api', (req, res) => {
    res.send('Hello World!');
});
app.use(express.json({ limit: '5000mb' }));  // Set to 50MB or any limit that works for you
app.use(express.urlencoded({ limit: '5000mb', extended: true }));

// Use the API routes
app.use('/api', apiRoutes);

// ENDPOINTS 

// ROUTES TO EDIT EXCEL FILES 
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
        employeeName,
        email,
        adminNotes
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
        employeeName,
        email,
        adminNotes
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

        // Set values directly for already merged cells
        worksheet.getCell('C4').value = employeeName;            // Entity Name in merged cells C4:D4
        worksheet.getCell('C5').value = email;                   // Email in merged cells C5:D5
        worksheet.getCell('C6').value = dateSubmitted;           // Date in merged cells C6:D6

        // Set Notes to Admin spanning G, H, I, J for rows 7, 8, and 9
        worksheet.getCell('G7').value = adminNotes;              // Notes to Admin (Row 7)
        worksheet.getCell('G8').value = adminNotes;              // Notes to Admin (Row 8)
        worksheet.getCell('G9').value = adminNotes;              // Notes to Admin (Row 9)

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
app.post('/api/edit-expense-report', async (req, res) => {
    const {
        employeeName,
        employeeEmail,
        province,
        dateSubmitted,
        monthOfExpenses,
        description,
        fundingStream,
        sourceGrant,
        dateOfExpense,
        account,
        travel,
        kms,
        breakfast,
        lunch,
        dinner,
        adminNotes,
    } = req.body;

    console.log('Received Data:', {
        employeeName,
        employeeEmail,
        province,
        dateSubmitted,
        monthOfExpenses,
        description,
        fundingStream,
        sourceGrant,
        dateOfExpense,
        account,
        travel,
        kms,
        breakfast,
        lunch,
        dinner,
        adminNotes,
    });

    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'files', 'PurchaseOrder.xlsx'); // Use the same Excel file

    try {
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet('Expense Report'); // Use the 'Expense Report' worksheet

        // Set values for the employee information section (merged cells C+D)
        worksheet.getCell('C4').value = employeeName;          // Employee Name
        worksheet.getCell('C5').value = employeeEmail;         // Employee Email (properly captured now)
        worksheet.getCell('C6').value = province;              // Province/Territory of Residence
        worksheet.getCell('C7').value = dateSubmitted;         // Date Submitted (auto-filled)
        worksheet.getCell('C8').value = monthOfExpenses;       // Month of Expenses

        // Set values for the expense details starting from row 13
        worksheet.getCell('B13').value = description;          // Description or Reason for Trip
        worksheet.getCell('C13').value = fundingStream;        // Funding Stream
        worksheet.getCell('D13').value = sourceGrant;          // Source / Grant

        // Ensure Date of Expense follows strict format
        const formattedDateOfExpense = new Date(dateOfExpense).toISOString().split('T')[0]; // Format YYYY-MM-DD
        worksheet.getCell('E13').value = formattedDateOfExpense; // Date of Expense (Y/M/D)

        // Correctly set the Account value from dropdown
        worksheet.getCell('F13').value = account;               // Account (dropdown value)

        // Set Travel and Kms only if travel is "Yes"
        worksheet.getCell('G13').value = travel;               // Travel (Yes/No)
        if (travel.toLowerCase() === 'yes') {
            worksheet.getCell('H13').value = kms;              // Kms
        }

        // Function to set dropdown values based on their position
        const selectDropdownOption = (cell, optionIndex) => {
            const dropdownCell = worksheet.getCell(cell);
            dropdownCell.value = null; // Clear any existing value

            if (optionIndex === 1) {
                dropdownCell.value = '✓'; // First option (Checkmark)
            } else if (optionIndex === 2) {
                dropdownCell.value = 'X'; // Second option (X mark)
            } else {
                dropdownCell.value = ''; // Default/Empty option
            }
        };

        // Assume 'breakfast', 'lunch', and 'dinner' variables contain the dropdown option index
        // 1 for Checkmark, 2 for X, and 0 for empty
        selectDropdownOption('K13', breakfast === '✓' ? 1 : breakfast === 'X' ? 2 : 0); // Breakfast
        selectDropdownOption('L13', lunch === '✓' ? 1 : lunch === 'X' ? 2 : 0);         // Lunch
        selectDropdownOption('M13', dinner === '✓' ? 1 : dinner === 'X' ? 2 : 0);       // Dinner

        // Set Notes to Admin in merged cells O-S 7-9
        worksheet.getCell('O7').value = adminNotes;            // Notes to Admin (multi-line text)

        const modifiedFilePath = path.join(__dirname, 'files', 'ModifiedExpenseReport.xlsx');
        await workbook.xlsx.writeFile(modifiedFilePath);

        // Send the modified file as a download
        res.download(modifiedFilePath, 'ModifiedExpenseReport.xlsx', (err) => {
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
