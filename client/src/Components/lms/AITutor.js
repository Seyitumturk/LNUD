import React, { useState } from 'react';
import './AITutor.css';

const AITutor = ({ onClose }) => {
    const [conversation, setConversation] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userQuestion, setUserQuestion] = useState('');
    const [pdfContent, setPdfContent] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('pdf', file);

            try {
                const response = await fetch('http://localhost:5000/api/upload-pdf', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    if (data.info) {
                        const infoString = Object.entries(data.info)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ');
                        throw new Error(`${data.error}\nPDF Info: ${infoString}`);
                    } else {
                        throw new Error(data.error || `HTTP error! status: ${response.status}`);
                    }
                }

                if (data.content && data.content.trim()) {
                    console.log('Extracted PDF content:', data.content);
                    setPdfContent(data.content);
                    setConversation([{ role: 'ai', content: `PDF uploaded successfully. Content length: ${data.content.length} characters` }]);
                } else {
                    throw new Error('No content extracted from the PDF. The file might contain only images or non-extractable content.');
                }
            } catch (error) {
                console.error('Error uploading PDF:', error);
                setConversation([{ role: 'ai', content: `Error uploading PDF: ${error.message}. Please try again with a different PDF.` }]);
            } finally {
                setIsLoading(false);
            }
        } else {
            setConversation([{ role: 'ai', content: 'Please select a valid PDF file.' }]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userQuestion.trim() || !pdfContent) return;

        setIsLoading(true);
        setConversation(prev => [...prev, { role: 'user', content: userQuestion }]);

        try {
            const response = await fetch('http://localhost:5000/api/ai-tutor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userQuestion,
                    presentationContent: pdfContent,
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
                {isLoading && <div className="message ai">Processing...</div>}
            </div>
            <div className="ai-tutor-upload">
                <input type="file" accept=".pdf" onChange={handleFileUpload} />
            </div>
            <form onSubmit={handleSubmit} className="ai-tutor-input">
                <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Ask a question about the PDF content..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default AITutor;