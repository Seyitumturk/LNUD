import React, { useState } from 'react';
import './AITutor.css';

const AITutor = ({ content, onClose }) => {
    const [userQuestion, setUserQuestion] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfContent, setPdfContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userQuestion.trim()) return;

        setIsLoading(true);
        setConversation([...conversation, { role: 'user', content: userQuestion }]);

        try {
            const response = await fetch('http://localhost:5000/api/ai-tutor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userQuestion,
                    presentationContent: pdfContent || content,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Unknown error occurred');
            }

            setConversation(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            setConversation(prev => [...prev, { role: 'ai', content: `Error: ${error.message}. Please try again.` }]);
        } finally {
            setIsLoading(false);
            setUserQuestion('');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            const formData = new FormData();
            formData.append('pdf', file);

            try {
                const response = await fetch('http://localhost:5000/api/upload-pdf', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setPdfContent(data.content);
                setConversation([{ role: 'ai', content: 'PDF uploaded successfully. You can now ask questions about its content.' }]);
            } catch (error) {
                console.error('Error uploading PDF:', error);
                setConversation([{ role: 'ai', content: `Error uploading PDF: ${error.message}. Please try again.` }]);
            }
        } else {
            setConversation([{ role: 'ai', content: 'Please upload a valid PDF file.' }]);
        }
    };

    return (
        <div className="ai-tutor-container">
            <div className="ai-tutor-header">
                <h3>AI Tutor</h3>
                <button onClick={onClose}>Close</button>
            </div>
            <div className="ai-tutor-conversation">
                {conversation.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        {message.content}
                    </div>
                ))}
                {isLoading && <div className="message ai">Thinking...</div>}
            </div>
            <div className="ai-tutor-upload">
                <input type="file" accept=".pdf" onChange={handleFileUpload} />
            </div>
            <form onSubmit={handleSubmit} className="ai-tutor-input">
                <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ask a question about the presentation..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default AITutor;