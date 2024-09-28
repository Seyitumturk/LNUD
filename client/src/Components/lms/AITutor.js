import React, { useState, useEffect } from 'react';
import './AITutor.css';
import { AiOutlineSend, AiOutlineClose, AiOutlineExpandAlt } from 'react-icons/ai';
import { BsThreeDots } from 'react-icons/bs';

const AITutor = ({ onClose, selectedCourseId, content }) => {
    const [userQuestion, setUserQuestion] = useState('');
    const [conversation, setConversation] = useState([{ role: 'ai', content: content }]); // Automatically start the conversation
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [typingMessage, setTypingMessage] = useState(''); // For streaming response letter by letter

    const toggleExpand = () => setIsExpanded(!isExpanded);

    // Function to handle GPT's response streaming letter by letter
    const streamGPTResponse = (text) => {
        let index = 0;
        setTypingMessage('');
        setIsLoading(true);

        const intervalId = setInterval(() => {
            if (index < text.length) {
                setTypingMessage((prev) => prev + text[index]);
                index++;
            } else {
                clearInterval(intervalId);
                setIsLoading(false);
            }
        }, 50); // 50ms delay between each letter for smooth typing effect
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userQuestion.trim()) return;
    
        setConversation([...conversation, { role: 'user', content: userQuestion }]);
        setIsLoading(true);
    
        try {
            // Fetch the PDF content associated with the course
            const pdfResponse = await fetch(`http://localhost:5000/api/courses-pdf/${selectedCourseId}`);
            if (!pdfResponse.ok) throw new Error('Failed to load PDF content');
    
            const { pdfContent } = await pdfResponse.json();
    
            // Send the question and PDF content to the AI API
            const response = await fetch('http://localhost:5000/api/ai-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userQuestion,
                    pdfContent,  // Send the extracted PDF content
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'AI tutor request failed');
            }
    
            const data = await response.json();
            streamGPTResponse(data.response);
        } catch (error) {
            setConversation((prev) => [
                ...prev,
                { role: 'ai', content: `Oops! Something went wrong: ${error.message}. Please try again later!` },
            ]);
            setIsLoading(false);
        } finally {
            setUserQuestion('');
        }
    };
    

    return (
        <div className={`ai-tutor-container ${isExpanded ? 'expanded' : ''}`}>
            <div className="ai-tutor-header">
                <h3>AI Tutor</h3>
                <div className="header-actions">
                    <button onClick={toggleExpand}>
                        {isExpanded ? <AiOutlineExpandAlt /> : <AiOutlineExpandAlt />}
                    </button>
                    <button onClick={onClose}>
                        <AiOutlineClose />
                    </button>
                </div>
            </div>
            <div className="ai-tutor-conversation">
                {conversation.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        {message.content}
                    </div>
                ))}

                {/* Typing effect for GPT response */}
                {typingMessage && (
                    <div className="message ai">
                        {typingMessage}
                    </div>
                )}

                {isLoading && (
                    <div className="message ai typing">
                        <BsThreeDots />
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="ai-tutor-input">
                <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="How can I help today? 😊"
                />
                <button type="submit">
                    <AiOutlineSend />
                </button>
            </form>
        </div>
    );
};

export default AITutor;
