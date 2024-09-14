import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf'; // Import jsPDF library for exporting PDFs
import './BarcodeSheet.css'; // Import the CSS file for styling

const BarcodeSheet = () => {
  const [isPerson, setIsPerson] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [barcodes, setBarcodes] = useState([]);
  const [savedBarcodes, setSavedBarcodes] = useState([]); // State to store saved barcodes
  const barcodeRefs = useRef([]);
  const generatedBarcodes = new Set(); // Set to store unique barcodes

  useEffect(() => {
    barcodes.forEach((barcode, index) => {
      if (barcodeRefs.current[index]) {
        JsBarcode(barcodeRefs.current[index], barcode.code, {
          format: 'CODE128',
          width: 3,
          height: 60,
          displayValue: true,
        });
      }
    });
  }, [barcodes]);

  const generateUniqueBarcode = () => {
    let code;
    do {
      code = Math.floor(1000000000000 + Math.random() * 9000000000000).toString(); // Generate a random barcode number
    } while (generatedBarcodes.has(code));
    generatedBarcodes.add(code);
    return code;
  };

  const handleGenerateBarcodes = (e) => {
    e.preventDefault();
    const newBarcodes = [];
    for (let i = 0; i < quantity; i++) {
      const code = generateUniqueBarcode();
      newBarcodes.push({ code, label: `${name} ${isPerson ? 'Person' : 'Item'} ${i + 1}` });
    }
    setBarcodes(newBarcodes);
  };

  const handleAddToSheet = (barcode) => {
    setSavedBarcodes((prev) => [...prev, barcode]);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    savedBarcodes.forEach((barcode, index) => {
      doc.text(barcode.label, 10, 10 + index * 20); // Display label
      doc.addImage(barcode.svg, 'PNG', 10, 20 + index * 20, 50, 20); // Add barcode SVG as an image
    });
    doc.save('barcodes.pdf'); // Export the document
  };

  return (
    <div className="barcode-sheet">
      <form onSubmit={handleGenerateBarcodes} className="barcode-form">
        <h2 className="form-title">Generate Barcodes</h2>
        <div className="form-group">
          <label>Type:</label>
          <select
            className="form-input"
            value={isPerson ? 'person' : 'item'}
            onChange={(e) => setIsPerson(e.target.value === 'person')}
          >
            <option value="person">Person</option>
            <option value="item">Item</option>
          </select>
        </div>
        <div className="form-group">
          <label>{isPerson ? 'Person Name' : 'Item Name'}:</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Number of Barcodes:</label>
          <input
            type="number"
            className="form-input"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            required
          />
        </div>
        <button type="submit" className="generate-button">Generate Barcodes</button>
      </form>

      <div className="barcode-display">
        {barcodes.map((barcode, index) => (
          <div key={index} className="barcode-item">
            <svg ref={(el) => (barcodeRefs.current[index] = el)} />
            <p>{barcode.label}</p>
            <button className="add-to-sheet-button" onClick={() => handleAddToSheet(barcode)}>Add to Sheet</button>
          </div>
        ))}
      </div>

      <div className="saved-barcode-sheet">
        <h2 className="sheet-title">Saved Barcodes</h2>
        <button className="export-button" onClick={handleExportPDF}>Export to PDF</button>
        <div className="barcode-display">
          {savedBarcodes.map((barcode, index) => (
            <div key={index} className="barcode-item">
              <p>{barcode.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarcodeSheet;
