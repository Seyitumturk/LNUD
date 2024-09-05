import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './excelchatbot.css'; // Import the CSS file for chatbot styling

const ExcelChatBot = ({ isOpen, toggleChatbot }) => {
    const [step, setStep] = useState(1);
    const [conversation, setConversation] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [currentForm, setCurrentForm] = useState(''); // State to track the current form (Purchase Order or Expense Report)
    const [data, setData] = useState({
        // Shared fields for both forms
        fundingStream: '',
        sourceGrant: '',
        account: '',
        // Purchase Order-specific fields
        productDescription: '',
        purchasedWith: '',
        quantity: '',
        costPerUnit: '',
        employeeName: '',
        email: '',
        dateSubmitted: '',
        adminNotes: '',
        // Expense Report-specific fields
        description: '',
        dateOfExpense: '',
        travel: '',
        kms: '',
        breakfast: '',
        lunch: '',
        dinner: '',
    });
    const [inputValue, setInputValue] = useState(''); // State to manage the text input value
    const chatLogRef = useRef(null); // Reference to the chat log container

    // Dropdown options for Funding Stream
    const fundingStreamOptions = [
        'Whole Foods Foundation',
        'NSERC ',
        'UNB via TD',
        'ISEDC',
        'UEC'
    ];

    // Dropdown options for Source / Grant based on Funding Stream selection
    const sourceGrantOptions = {
        'Whole Foods Foundation': ['Whole Kids Garden Grant'],
        'NSERC ': ['PromoScience 2023'],
        'UNB via TD': ['TD Challenge Award (External)'],
        'ISEDC': ['IIPP'],
        'UEC': [
            'Windhorse Grand Opening',
            'Orange Bracelet',
            'MCF Digital Acceleration',
            'FPIC-ESDC',
            'Asitu’lisk HWA Treatment',
            'Youth Farmers Market',
            'Modernizing Traditional',
            'Grow With The Flow',
            'CERI',
            'Science & Innovation',
            'Pathways to Engineering',
            'Collegiate Prep Supplement'
        ]
    };

    // Dropdown options for Meals (using actual symbols)
    const mealOptions = ['X', '✓']; // X or Checkmark symbol

    // Manually provided Account options
    const accountOptions = [
        'Accounting and Legal',
        'Admin Fee',
        'Advertising & Promotion',
        'Amortization Expense',
        'Conference Fees',
        'Consulting',
        'Courier & Postage',
        'Dues & Subscriptions',
        'Project Supplies',
        'Elders Honorarium',
        'Elders Travel',
        'Equipment - Computer',
        'Furniture - Office',
        'Participants Materials',
        'Auto Leasing',
        'Fuel',
        'Insurance',
        'Marketing and Communications',
        'Maintenance and Repairs',
        'Meetings',
        'Office Supplies',
        'Rent',
        'Software',
        'Catering Expense',
        'Speakers',
        'Service Contracts',
        'Telephone',
        'Training and Development',
        'Travel - Board of Directors',
        'Travel - Staff',
        'Travel - Others',
        'Utilities',
        'Hospitality/Food',
        'Special Events',
        'Project Cost Equipment & Rental'
    ];

    // Initial options for the chatbot
    const initialOptions = [
        'Purchase Order',  // Option for editing Purchase Order
        'Expense Report'   // Option for editing Expense Report
    ];

    // Effect to handle the first question when the chatbot opens
    useEffect(() => {
        if (isOpen && conversation.length === 0) {
            setConversation([{ sender: 'bot', text: 'Welcome! How can I assist you today?', options: initialOptions }]);
        }
    }, [isOpen, conversation]);

    // Effect to auto-scroll to the bottom when the conversation updates
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [conversation]);

    const handleUserInput = (input) => {
        let newConversation = [...conversation, { sender: 'user', text: input }];
        let newData = { ...data };

        if (step === 1) {  // Initial step to choose between options
            if (input === 'Purchase Order') {
                setCurrentForm('PurchaseOrder');
                newConversation.push({ sender: 'bot', text: 'What is the Product Description?' });
                setStep(2);  // Proceed to the next step for Purchase Order
            } else if (input === 'Expense Report') {
                setCurrentForm('ExpenseReport');
                newConversation.push({ sender: 'bot', text: 'What is the Description or Reason for Trip?' });
                setStep(100);  // Proceed to the next step for Expense Report
            }
        } else if (currentForm === 'PurchaseOrder') {
            // Purchase Order Logic
            switch (step) {
                case 2:
                    newData.productDescription = input;
                    newConversation.push({ sender: 'bot', text: 'What is the Funding Stream?', options: fundingStreamOptions });
                    setStep(3);
                    break;
                case 3:
                    newData.fundingStream = input;
                    const grants = sourceGrantOptions[input];
                    newConversation.push({ sender: 'bot', text: 'What is the Source / Grant?', options: grants });
                    setStep(4);
                    break;
                case 4:
                    newData.sourceGrant = input;
                    newConversation.push({ sender: 'bot', text: 'What is the Account?', options: accountOptions });
                    setStep(5);
                    break;
                case 5:
                    newData.account = input;
                    newConversation.push({ sender: 'bot', text: 'What was the item Purchased With?' });
                    setStep(6);
                    break;
                case 6:
                    newData.purchasedWith = input;
                    newConversation.push({ sender: 'bot', text: 'What is the Quantity (QTY)?' });
                    setStep(7);
                    break;
                case 7:
                    if (isNaN(input) || input.trim() === '') {
                        newConversation.push({ sender: 'bot', text: 'Please enter a valid numeric value for Quantity.' });
                    } else {
                        newData.quantity = parseFloat(input); // Convert to numeric
                        newConversation.push({ sender: 'bot', text: 'What is the Cost per Unit?' });
                        setStep(8);
                    }
                    break;
                case 8:
                    if (isNaN(input) || input.trim() === '') {
                        newConversation.push({ sender: 'bot', text: 'Please enter a valid numeric value for Cost per Unit.' });
                    } else {
                        newData.costPerUnit = parseFloat(input); // Convert to numeric
                        newConversation.push({ sender: 'bot', text: 'What is your Employee Name?' });
                        setStep(9);
                    }
                    break;
                case 9:
                    newData.employeeName = input;
                    newConversation.push({ sender: 'bot', text: 'Please provide your Email Address.' });
                    setStep(10);
                    break;
                case 10:
                    newData.email = input;
                    newConversation.push({ sender: 'bot', text: 'Any notes to admin?' });
                    setStep(11);
                    break;
                case 11:
                    newData.adminNotes = input;  // Capture the new "admin notes" field
                    newConversation.push({ sender: 'bot', text: 'Thank you! Processing your input... File will be downloaded shortly.' });
                    setStep(12);
                    handlePurchaseOrderSubmit(newData);  // Call handlePurchaseOrderSubmit with the complete data
                    break;
                default:
                    break;
            }
        } else if (currentForm === 'ExpenseReport') {
            // Expense Report Logic
            switch (step) {
                case 100:
                    newData.description = input;
                    newConversation.push({ sender: 'bot', text: 'What is the Funding Stream?', options: fundingStreamOptions });
                    setStep(101);
                    break;
                case 101:
                    newData.fundingStream = input;
                    const grants = sourceGrantOptions[input];
                    newConversation.push({ sender: 'bot', text: 'What is the Source / Grant?', options: grants });
                    setStep(102);
                    break;
                case 102:
                    newData.sourceGrant = input;
                    newConversation.push({ sender: 'bot', text: 'What is the Date of Expense (Y/M/D)?' });
                    setStep(103);
                    break;
                case 103:
                    newData.dateOfExpense = input;
                    newConversation.push({ sender: 'bot', text: 'Please select the Account:', options: accountOptions });
                    setStep(104);
                    break;
                case 104:
                    newData.account = input;
                    newConversation.push({ sender: 'bot', text: 'Is this Travel Expense? (Yes/No)' });
                    setStep(105);
                    break;
                case 105:
                    newData.travel = input;
                    if (input.toLowerCase() === 'yes') {
                        newConversation.push({ sender: 'bot', text: 'Enter Kms:' });
                        setStep(106);  // Unlock next fields if Travel is "Yes"
                    } else {
                        newConversation.push({ sender: 'bot', text: 'Enter Breakfast (X or ✓):', options: mealOptions });
                        setStep(107); // Proceed to meals section if Travel is "No"
                    }
                    break;
                case 106:
                    newData.kms = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Breakfast (X or ✓):', options: mealOptions });
                    setStep(107);
                    break;
                case 107:
                    newData.breakfast = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Lunch (X or ✓):', options: mealOptions });
                    setStep(108);
                    break;
                case 108:
                    newData.lunch = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Dinner (X or ✓):', options: mealOptions });
                    setStep(109);
                    break;
                case 109:
                    newData.dinner = input;
                    newConversation.push({ sender: 'bot', text: 'Thank you! Processing your input... File will be downloaded shortly.' });
                    setStep(110);
                    handleExpenseReportSubmit(newData);  // Call handleExpenseReportSubmit with the complete data
                    break;
                default:
                    break;
            }
        }

        setData(newData);
        setConversation(newConversation);
        setInputValue('');  // Clear input after sending
    };

    const handlePurchaseOrderSubmit = async (formData) => {
        // Submit logic for Purchase Order
        try {
            const response = await axios.post(
                'http://localhost:5000/api/edit-excel',
                {
                    ...formData,
                    totalCost: formData.quantity * formData.costPerUnit, // Calculate total cost
                },
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ModifiedPurchaseOrder.xlsx');
            document.body.appendChild(link);
            link.click();

            setSubmitted(true);
        } catch (error) {
            console.error('Error editing Excel file:', error);
        }
    };

    const handleExpenseReportSubmit = async (formData) => {
        // Submit logic for Expense Report
        try {
            const response = await axios.post(
                'http://localhost:5000/api/edit-expense-report',
                formData,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'ModifiedExpenseReport.xlsx');
            document.body.appendChild(link);
            link.click();

            setSubmitted(true);
        } catch (error) {
            console.error('Error editing Excel file:', error);
        }
    };

    const renderOptions = (options) => {
        return (
            <div className="options-container">
                {options.map((option, index) => (
                    <button key={index} className="option-button" onClick={() => handleUserInput(option)}>
                        {option}
                    </button>
                ))}
            </div>
        );
    };

    if (!isOpen) return null; // Do not render if not open

    return (
        <div className="excel-chatbot">
            <div className="excel-chatbot-header">
                {currentForm === 'PurchaseOrder' ? 'Purchase Order ChatBot' : 'Expense Report ChatBot'}
            </div>
            <div className="excel-chatbot-body">
                <div className="chat-log" ref={chatLogRef}>
                    {conversation.map((msg, index) => (
                        <div key={index} className={msg.sender === 'user' ? 'user' : 'assistant'}>
                            <p>{msg.text}</p>
                            {msg.options && renderOptions(msg.options)}
                        </div>
                    ))}
                </div>
                {!conversation[conversation.length - 1]?.options && (
                    <form onSubmit={(e) => { e.preventDefault(); handleUserInput(inputValue); }} className="chat-input-container">
                        <textarea
                            rows="2"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your answer here..."
                        />
                        <button type="submit" className="send-button">Send</button>
                    </form>
                )}
                {submitted && <p>Thank you! Your {currentForm === 'PurchaseOrder' ? 'purchase order' : 'expense report'} is ready for download.</p>}
            </div>
        </div>
    );
};

export default ExcelChatBot;
