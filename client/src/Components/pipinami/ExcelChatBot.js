import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './excelchatbot.css';

const ExcelChatBot = ({ isOpen, toggleChatbot }) => {
    const [step, setStep] = useState(1);
    const [conversation, setConversation] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [currentForm, setCurrentForm] = useState('');
    const [data, setData] = useState({
        fundingStream: '',
        sourceGrant: '',
        account: '',
        productDescription: '',
        purchasedWith: '',
        quantity: '',
        costPerUnit: '',
        employeeName: '',
        email: '',
        dateSubmitted: '',
        adminNotes: '',
        description: '',
        dateOfExpense: '',
        travel: '',
        kms: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        province: '',
        monthOfExpenses: ''
    });
    const [inputValue, setInputValue] = useState('');
    const chatLogRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typedText, setTypedText] = useState('');
    const typingSpeed = 50; // milliseconds per character

    const fundingStreamOptions = [
        'Whole Foods Foundation',
        'NSERC ',
        'UNB via TD',
        'ISEDC',
        'UEC'
    ];

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

    const mealOptions = ['X', '✓'];

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

    const initialOptions = [
        'Purchase Order',
        'Expense Report'
    ];

    const initialMessage = "Hey, I'm Pipinami! I'm an AI assistant specialized in Ulnooweg's operations, Standard Operating Procedures (SOPs), and organizational knowledge. I'm here to help you with any questions about Ulnooweg's processes, policies, or projects. And exciting news - soon, I'll be able to communicate in Mi'kmaq as well! How can I assist you today?";

    useEffect(() => {
        if (isOpen && conversation.length === 0) {
            typeText(initialMessage);
        }
    }, [isOpen, conversation]);

    const typeText = (text) => {
        setIsTyping(true);
        setTypedText(''); // Reset typed text at the start
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                setTypedText(text.slice(0, i + 1)); // Use slice instead of concatenation
                i++;
            } else {
                clearInterval(typing);
                setIsTyping(false);
                setConversation([
                    {
                        sender: 'assistant',
                        text: text,
                        options: initialOptions
                    }
                ]);
            }
        }, typingSpeed);
    };

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [conversation]);

    const simulateTyping = (message, options) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setConversation(prev => [...prev, { sender: 'assistant', text: message, options }]);
        }, 1500); // Adjust the delay as needed
    };

    const handleUserInput = (input) => {
        let newConversation = [...conversation, { sender: 'user', text: input }];
        let newData = { ...data };

        if (step === 1) {
            if (input === 'Purchase Order') {
                setCurrentForm('PurchaseOrder');
                simulateTyping('What is the Product Description?', null);
                setStep(2);
            } else if (input === 'Expense Report') {
                setCurrentForm('ExpenseReport');
                simulateTyping('What is your Employee Name?', null);
                setStep(100);
            }
        } else if (currentForm === 'PurchaseOrder') {
            switch (step) {
                case 2:
                    newData.productDescription = input;
                    simulateTyping('What is the Funding Stream?', fundingStreamOptions);
                    setStep(3);
                    break;
                case 3:
                    newData.fundingStream = input;
                    const grants = sourceGrantOptions[input];
                    simulateTyping('What is the Source / Grant?', grants);
                    setStep(4);
                    break;
                case 4:
                    newData.sourceGrant = input;
                    simulateTyping('What is the Account?', accountOptions);
                    setStep(5);
                    break;
                case 5:
                    newData.account = input;
                    simulateTyping('What was the item Purchased With?', null);
                    setStep(6);
                    break;
                case 6:
                    newData.purchasedWith = input;
                    simulateTyping('What is the Quantity (QTY)?', null);
                    setStep(7);
                    break;
                case 7:
                    if (isNaN(input) || input.trim() === '') {
                        simulateTyping('Please enter a valid numeric value for Quantity.', null);
                    } else {
                        newData.quantity = parseFloat(input);
                        simulateTyping('What is the Cost per Unit?', null);
                        setStep(8);
                    }
                    break;
                case 8:
                    if (isNaN(input) || input.trim() === '') {
                        simulateTyping('Please enter a valid numeric value for Cost per Unit.', null);
                    } else {
                        newData.costPerUnit = parseFloat(input);
                        simulateTyping('What is your Employee Name?', null);
                        setStep(9);
                    }
                    break;
                case 9:
                    newData.employeeName = input;
                    simulateTyping('Please provide your Email Address.', null);
                    setStep(10);
                    break;
                case 10:
                    newData.email = input;
                    simulateTyping('Any notes to admin?', null);
                    setStep(11);
                    break;
                case 11:
                    newData.adminNotes = input;
                    simulateTyping('Thank you! Processing your input... File will be downloaded shortly.', null);
                    setStep(12);
                    handlePurchaseOrderSubmit(newData);
                    break;
                default:
                    break;
            }
        } else if (currentForm === 'ExpenseReport') {
            switch (step) {
                case 100:
                    newData.employeeName = input;
                    simulateTyping('What is your Email Address?', null);
                    setStep(101);
                    break;
                case 101:
                    newData.email = input;
                    if (!input || input.trim() === '') {
                        simulateTyping('Please provide a valid Email Address.', null);
                    } else {
                        simulateTyping('What is your Province/Territory of Residence?', null);
                        setStep(102);
                    }
                    break;

                case 102:
                    newData.province = input;
                    const today = new Date().toISOString().split('T')[0];
                    newData.dateSubmitted = today;
                    simulateTyping(`Date Submitted is set to ${today}. What is the Month of Expenses (YYYY/MM)?`, null);
                    setStep(103);
                    break;
                case 103:
                    newData.monthOfExpenses = input;
                    simulateTyping('What is the Description or Reason for Trip?', null);
                    setStep(104);
                    break;
                case 104:
                    newData.description = input;
                    simulateTyping('What is the Funding Stream?', fundingStreamOptions);
                    setStep(105);
                    break;
                case 105:
                    newData.fundingStream = input;
                    const grants = sourceGrantOptions[input];
                    simulateTyping('What is the Source / Grant?', grants);
                    setStep(106);
                    break;
                case 106:
                    newData.sourceGrant = input;
                    simulateTyping('What is the Date of Expense (Y/M/D)?', null);
                    setStep(107);
                    break;
                case 107:
                    newData.dateOfExpense = input;
                    simulateTyping('Please select the Account:', accountOptions);
                    setStep(108);
                    break;
                case 108:
                    newData.account = input;
                    simulateTyping('Is this Travel Expense? (Yes/No)', null);
                    setStep(109);
                    break;
                case 109:
                    newData.travel = input;
                    if (input.toLowerCase() === 'yes') {
                        simulateTyping('Enter Kms:', null);
                        setStep(110);
                    } else {
                        simulateTyping('Enter Breakfast (X or ✓):', mealOptions);
                        setStep(111);
                    }
                    break;
                case 110:
                    newData.kms = input;
                    simulateTyping('Enter Breakfast (X or ✓):', mealOptions);
                    setStep(111);
                    break;
                case 111:
                    newData.breakfast = input;
                    simulateTyping('Enter Lunch (X or ✓):', mealOptions);
                    setStep(112);
                    break;
                case 112:
                    newData.lunch = input;
                    simulateTyping('Enter Dinner (X or ✓):', mealOptions);
                    setStep(113);
                    break;
                case 113:
                    newData.dinner = input;
                    simulateTyping('Any notes to admin?', null);
                    setStep(114);
                    break;
                case 114:
                    newData.adminNotes = input;
                    simulateTyping('Thank you! Processing your input... File will be downloaded shortly.', null);
                    setStep(115);
                    handleExpenseReportSubmit(newData);
                    break;
                default:
                    break;
            }
        }

        setData(newData);
        setConversation(newConversation);
        setInputValue('');
    };

    const handlePurchaseOrderSubmit = async (formData) => {
        try {
            const response = await axios.post(
                'http://localhost:5000/api/edit-excel',
                {
                    ...formData,
                    totalCost: formData.quantity * formData.costPerUnit,
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

    if (!isOpen) return null;

    return (
        <div className="excel-chatbot">
            <h2 className="chatbot-header">Pipinami</h2>
            <div className="chat-log" ref={chatLogRef}>
                {conversation.length === 0 ? (
                    <div className="message assistant">
                        <p className="typed-text">{typedText}</p>
                    </div>
                ) : (
                    conversation.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>
                            <p>{msg.text}</p>
                            {msg.options && (
                                <div className="options-container">
                                    {msg.options.map((option, idx) => (
                                        <button key={idx} onClick={() => handleUserInput(option)}>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="message assistant">
                        <p>
                            <span className="typing-animation">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </p>
                    </div>
                )}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUserInput(inputValue); }} className="chat-input">
                <div className="input-container">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your question here..."
                    />
                    <button type="submit">Send</button>
                </div>
            </form>
            {submitted && <p className="submission-message">Thank you! Your {currentForm === 'PurchaseOrder' ? 'purchase order' : 'expense report'} is ready for download.</p>}
        </div>
    );
};

export default ExcelChatBot;
