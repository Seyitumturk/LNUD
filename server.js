require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs'); // Import ExcelJS
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require('cors'); // Import CORS

// Middleware
app.use(cors()); // Use CORS
// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lnud-db', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Basic route
app.get('/api', (req, res) => {
    res.send('Hello World!');
});

// Route to edit Excel file
app.post('/api/edit-excel', async (req, res) => {
    const {
        dateSubmitted,
        productDescription,
        fundingStream,
        sourceGrant,
        account,
        purchasedWith,
        quantity,
        costPerUnit
    } = req.body;

    const workbook = new ExcelJS.Workbook();
    const filePath = path.join(__dirname, 'files', 'PurchaseOrder.xlsx'); // Path to your Excel file
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet('Purchase Order');

    // Autofill "Date Submitted"
    worksheet.getCell('B6').value = dateSubmitted; // Date Submitted field

    // Fill in the "Product Description" without validation issues
    worksheet.getCell('B12').value = productDescription; // Product Description

    // Get allowed values from dropdown options (data validation) for cells C12 and D12
    const fundingStreamValidation = worksheet.getCell('C12').dataValidation;
    const sourceGrantValidation = worksheet.getCell('D12').dataValidation;

    // Check if the provided input matches the allowed dropdown values
    if (fundingStreamValidation && fundingStreamValidation.formula1) {
        const allowedFundingStreams = fundingStreamValidation.formula1.split(',').map(v => v.trim().replace(/"/g, ''));
        if (!allowedFundingStreams.includes(fundingStream)) {
            return res.status(400).send('Invalid Funding Stream selected. Please choose from the dropdown options.');
        }
    }
    if (sourceGrantValidation && sourceGrantValidation.formula1) {
        const allowedSourceGrants = sourceGrantValidation.formula1.split(',').map(v => v.trim().replace(/"/g, ''));
        if (!allowedSourceGrants.includes(sourceGrant)) {
            return res.status(400).send('Invalid Source / Grant selected. Please choose from the dropdown options.');
        }
    }

    // Write valid data to cells
    worksheet.getCell('C12').value = fundingStream; // Funding Stream
    worksheet.getCell('D12').value = sourceGrant;   // Source / Grant
    worksheet.getCell('E12').value = account;       // Account
    worksheet.getCell('F12').value = purchasedWith; // Purchased With
    worksheet.getCell('G12').value = quantity;      // QTY
    worksheet.getCell('H12').value = costPerUnit;   // Cost per Unit

    const modifiedFilePath = path.join(__dirname, 'files', 'ModifiedPurchaseOrder.xlsx');
    await workbook.xlsx.writeFile(modifiedFilePath);

    // Send the modified file as a download
    res.download(modifiedFilePath, 'ModifiedPurchaseOrder.xlsx', (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        }
    });
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
