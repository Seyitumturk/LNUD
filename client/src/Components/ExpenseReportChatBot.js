import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './excelchatbot.css'; // Import the CSS file for chatbot styling

const ExpenseReportChatBot = ({ isOpen, toggleChatbot }) => { // Accept `isOpen` and `toggleChatbot` as props
    const [step, setStep] = useState(1);
    const [conversation, setConversation] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [data, setData] = useState({
        description: '',
        fundingStream: '',
        sourceGrant: '',
        account: '',
        dateOfExpense: '',
        travel: '',
        kms: '',
        kmRate: '',
        kmCost: '',
        breakfast: '',
        lunch: '',
        dinner: '',
        misc: '',
        hstOnTravel: '',
        hstOnAccom: '',
        hstOnMisc: '',
        total: ''
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
        'Expense Report',  // Option for editing Expense Report
        'Purchase Order'  // Another option (already implemented)
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
            if (input === 'Expense Report') {
                newConversation.push({ sender: 'bot', text: 'What is the Description or Reason for Trip?' });
                setStep(2);  // Proceed to the next step for editing Excel
            }
        } else {  // Proceed with Expense Report editing steps
            switch (step) {
                case 2:
                    newData.description = input;
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
                    newConversation.push({ sender: 'bot', text: 'What is the Date of Expense (Y/M/D)?' });
                    setStep(5);
                    break;
                case 5:
                    newData.dateOfExpense = input;
                    newConversation.push({ sender: 'bot', text: 'What is the Account?' });
                    setStep(6);
                    break;
                case 6:
                    newData.account = input;
                    newConversation.push({ sender: 'bot', text: 'Is this Travel Expense? (Yes/No)' });
                    setStep(7);
                    break;
                case 7:
                    newData.travel = input;
                    if (input.toLowerCase() === 'yes') {
                        newConversation.push({ sender: 'bot', text: 'Enter Kms:' });
                        setStep(8);  // Unlock next fields if Travel is "Yes"
                    } else {
                        newConversation.push({ sender: 'bot', text: 'Thank you! Processing your input... File will be downloaded shortly.' });
                        setStep(99);  // Skip to the end
                        handleSubmit(newData);  // Call handleSubmit with the complete data
                    }
                    break;
                case 8:
                    newData.kms = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Km Rate:' });
                    setStep(9);
                    break;
                case 9:
                    newData.kmRate = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Km Cost:' });
                    setStep(10);
                    break;
                case 10:
                    newData.kmCost = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Breakfast Cost:' });
                    setStep(11);
                    break;
                case 11:
                    newData.breakfast = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Lunch Cost:' });
                    setStep(12);
                    break;
                case 12:
                    newData.lunch = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Dinner Cost:' });
                    setStep(13);
                    break;
                case 13:
                    newData.dinner = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Misc Cost:' });
                    setStep(14);
                    break;
                case 14:
                    newData.misc = input;
                    newConversation.push({ sender: 'bot', text: 'Enter HST on Travel:' });
                    setStep(15);
                    break;
                case 15:
                    newData.hstOnTravel = input;
                    newConversation.push({ sender: 'bot', text: 'Enter HST on Accom:' });
                    setStep(16);
                    break;
                case 16:
                    newData.hstOnAccom = input;
                    newConversation.push({ sender: 'bot', text: 'Enter HST on Misc:' });
                    setStep(17);
                    break;
                case 17:
                    newData.hstOnMisc = input;
                    newConversation.push({ sender: 'bot', text: 'Enter Total:' });
                    setStep(18);
                    break;
                case 18:
                    newData.total = input;
                    newConversation.push({ sender: 'bot', text: 'Thank you! Processing your input... File will be downloaded shortly.' });
                    setStep(19);
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
                Expense Report ChatBot
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
                {submitted && <p>Thank you! Your expense report is ready for download.</p>}
            </div>
        </div>
    );
};

export default ExpenseReportChatBot;
