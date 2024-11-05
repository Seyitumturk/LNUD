// AITutor.js
import React, { useState } from 'react';
import './AITutor.css';

const AITutor = ({ selectedCourseId, content, onClose, onProgress, character }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          courseId: selectedCourseId
        })
      });

      const data = await response.json();
      
      // Simulate typing delay for more natural interaction
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
        setIsTyping(false);
        
        // Award experience points for good questions
        onProgress(10);
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-tutor-container">
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.type === 'bot' && (
              <div className="bot-avatar">
                {/* Add your bot avatar image here */}
              </div>
            )}
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about the course..."
          className="chat-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default AITutor;
