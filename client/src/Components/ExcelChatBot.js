import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './excelchatbot.css'; // Import the CSS file for chatbot styling

const ExcelChatBot = ({ isOpen, toggleChatbot }) => {
    const [step, setStep] = useState(1);
    const [conversation, setConversation] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState({
        productDescription: '',
        fundingStream: '',
        sourceGrant: '',
        account: '',
        purchasedWith: '',
        quantity: '',
        costPerUnit: '',
        employeeName: '',
        email: '',
        dateSubmitted: '',  // Auto-generated date will be handled in the handleSubmit function
        adminNotes: '',  // New field for notes to admin
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

    // Initial options for the chatbot
    const initialOptions = [
        'Purchase Order',  // Option for editing Excel files
        'Expense Reports'  // Another option (not coded yet)
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
                newConversation.push({ sender: 'bot', text: 'What is the Product Description?' });
                setStep(2);  // Proceed to the next step for editing Excel
            } else if (input === 'Expense Reports') {
                newConversation.push({ sender: 'bot', text: 'Feature coming soon!' });
                setStep(1);  // Remain on the same step until implemented
            }
        } else {  // Proceed with Excel editing steps
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
                    newConversation.push({ sender: 'bot', text: 'What is the Account?' });
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
                    newData.quantity = input;
                    if (isNaN(input) || input.trim() === '') {
                        newConversation.push({ sender: 'bot', text: 'Please enter a valid numeric value for Quantity.' });
                    } else {
                        newData.quantity = parseFloat(input); // Convert to numeric
                        newConversation.push({ sender: 'bot', text: 'What is the Cost per Unit?' });
                        setStep(8);
                    }
                    break;
                case 8:
                    newData.costPerUnit = input;
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
                    handleSubmit(newData);  // Call handleSubmit with the complete data
                    break;
                default:
                    break;
            }
        }

        setData(newData);
        setConversation(newConversation);
        setInputValue('');  // Clear input after sending
    };

    const handleSubmit = async (formData) => {
        // Ensure the date is formatted correctly
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

        try {
            const response = await axios.post(
                'http://localhost:5000/api/edit-excel',
                {
                    ...formData,
                    dateSubmitted: formData.dateSubmitted || today, // Use provided date or today's date
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
                Purchase Order ChatBot
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
                {submitted && <p>Thank you! Your purchase order is ready for download.</p>}
            </div>
        </div>
    );
};

export default ExcelChatBot;
