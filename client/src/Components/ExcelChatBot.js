import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './excelchatbot.css'; // Import the CSS file for chatbot styling

const ExcelChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
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
    });

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

    // Effect to handle the first question when the chatbot opens
    useEffect(() => {
        if (isOpen && conversation.length === 0) {
            setConversation([{ sender: 'bot', text: 'What is the Product Description?' }]);
        }
    }, [isOpen, conversation]);

    // Effect to auto-scroll to the bottom when the conversation updates
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [conversation]);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setConversation([]); // Reset conversation when closing
            setStep(1); // Reset steps when closing
            setSubmitted(false);
        }
    };

    const handleUserInput = (input) => {
        let newConversation = [...conversation, { sender: 'user', text: input }];
        let newData = { ...data };

        switch (step) {
            case 1:
                newData.productDescription = input;
                newConversation.push({ sender: 'bot', text: 'What is the Funding Stream?', options: fundingStreamOptions });
                setStep(2);
                break;
            case 2:
                newData.fundingStream = input;
                const grants = sourceGrantOptions[input];
                newConversation.push({ sender: 'bot', text: 'What is the Source / Grant?', options: grants });
                setStep(3);
                break;
            case 3:
                newData.sourceGrant = input;
                newConversation.push({ sender: 'bot', text: 'What is the Account?' });
                setStep(4);
                break;
            case 4:
                newData.account = input;
                newConversation.push({ sender: 'bot', text: 'What was the item Purchased With?' });
                setStep(5);
                break;
            case 5:
                newData.purchasedWith = input;
                newConversation.push({ sender: 'bot', text: 'What is the Quantity (QTY)?' });
                setStep(6);
                break;
            case 6:
                newData.quantity = input;
                newConversation.push({ sender: 'bot', text: 'What is the Cost per Unit?' });
                setStep(7);
                break;
            case 7:
                newData.costPerUnit = input;
                newConversation.push({ sender: 'bot', text: 'Thank you! Processing your input... Click the button below to download the modified Excel file.' });
                setStep(8);
                handleSubmit(newData); // Call handleSubmit with the final data
                break;
            default:
                break;
        }

        setData(newData);
        setConversation(newConversation);
    };

    const handleSubmit = async (formData) => {
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

        try {
            const response = await axios.post(
                'http://localhost:5000/api/edit-excel',
                { ...formData, dateSubmitted: today },
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

    return (
        <div className="excel-chatbot-container">
            {!isOpen && (
                <button className="excel-chatbot-toggle" onClick={toggleChatbot}>
                    Chat with Us
                </button>
            )}

            {isOpen && (
                <div className="excel-chatbot">
                    <div className="excel-chatbot-header">
                        Purchase Order ChatBot
                        <button className="close-button" onClick={toggleChatbot}>✖</button>
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
                        {step === 1 || (step > 3 && step <= 7) ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleUserInput(e.target.elements[0].value); }} className="chat-input-container">
                                <textarea
                                    rows="2"
                                    placeholder="Type your answer here..."
                                />
                                <button type="submit" className="send-button">Send</button>
                            </form>
                        ) : null}
                        {submitted && <p>Thank you! Your purchase order is ready for download.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelChatBot;
