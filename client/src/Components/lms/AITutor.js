import React, { useState } from 'react';
import './AITutor.css';
import { AiOutlineSend, AiOutlineClose, AiOutlineExpandAlt } from 'react-icons/ai';
import { BsThreeDots } from 'react-icons/bs';

const AITutor = ({ onClose, selectedCourseId }) => {
    const [userQuestion, setUserQuestion] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userQuestion.trim()) return;

        if (!selectedCourseId) {
            setConversation((prev) => [
                ...prev,
                { role: 'ai', content: 'No course selected. Please select a course to get started 😊.' },
            ]);
            return;
        }

        setIsLoading(true);
        setConversation([...conversation, { role: 'user', content: userQuestion }]);

        try {
            const pdfResponse = await fetch(`http://localhost:5000/api/courses-pdf/${selectedCourseId}`);
            if (!pdfResponse.ok) throw new Error('Failed to load PDF content');

            const coursePdf = await pdfResponse.json();

            const response = await fetch('http://localhost:5000/api/ai-tutor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userQuestion,
                    pdfContent: coursePdf,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'AI tutor request failed');
            }

            const data = await response.json();
            setConversation((prev) => [...prev, { role: 'ai', content: data.response }]);
        } catch (error) {
            setConversation((prev) => [
                ...prev,
                { role: 'ai', content: `Oops! Something went wrong: ${error.message}. Please try again later!` },
            ]);
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
