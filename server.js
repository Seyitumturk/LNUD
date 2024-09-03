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
        costPerUnit,
    } = req.body;

    // Debugging: Log the input data to ensure all values are received correctly
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
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet('Purchase Order');

    // Ensure each cell is updated correctly
    try {
        worksheet.getCell('B6').value = dateSubmitted;           // Date Submitted field
        worksheet.getCell('B12').value = productDescription;     // Product Description
        worksheet.getCell('C12').value = fundingStream;          // Funding Stream (Dropdown)
        worksheet.getCell('D12').value = sourceGrant;            // Source / Grant (Dropdown)
        worksheet.getCell('E12').value = account;                // Account (First part of merged cell)
        worksheet.getCell('F12').value = account;                // Account (Second part of merged cell)
        worksheet.getCell('G12').value = purchasedWith;          // Purchased With
        worksheet.getCell('H12').value = quantity;               // QTY
        worksheet.getCell('I12').value = costPerUnit;            // Cost per Unit
    } catch (error) {
        console.error('Error writing to Excel cells:', error);
    }

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
