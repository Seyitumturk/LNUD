import React, { useState, useEffect } from 'react';
import './AITutor.css';
import { AiOutlineSend, AiOutlineFilePdf } from 'react-icons/ai';
import { BsThreeDots } from 'react-icons/bs';

const AITutor = ({ onClose, selectedCourseId }) => {
    const [userQuestion, setUserQuestion] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userQuestion.trim()) return;

        setIsLoading(true);
        setConversation([...conversation, { role: 'user', content: userQuestion }]);

        try {
            // Fetch the PDF content of the selected course
            const pdfResponse = await fetch(`http://localhost:5000/api/courses-pdf/${selectedCourseId}`);
            const coursePdf = await pdfResponse.json();

            // Send the question and PDF content to the AI tutor
            const response = await fetch('http://localhost:5000/api/ai-tutor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userQuestion,
                    pdfContent: coursePdf,  // Attach the PDF content to the question
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unknown error occurred');
            }

            setConversation(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (error) {
            setConversation(prev => [...prev, { role: 'ai', content: `Error: ${error.message}. Please try again.` }]);
        } finally {
            setIsLoading(false);
            setUserQuestion('');
        }
    };

    return (
        <div className={`ai-tutor-container ${isExpanded ? 'expanded' : ''}`}>
            <div className="ai-tutor-header">
                <h3>AI Tutor</h3>
                <div className="header-actions">
                    <button onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? 'Minimize' : 'Expand'}
                    </button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
            <div className="ai-tutor-conversation">
                {conversation.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        {message.content}
                    </div>
                ))}
                {isLoading && <div className="message ai typing"><BsThreeDots /></div>}
            </div>
            <form onSubmit={handleSubmit} className="ai-tutor-input">
                <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ask a question..."
                />
                <button type="submit"><AiOutlineSend /></button>
            </form>
        </div>
    );
};

export default AITutor;
