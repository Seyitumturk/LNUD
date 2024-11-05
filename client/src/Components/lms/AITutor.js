// AITutor.js
import React, { useState, useEffect } from 'react';
import './AITutor.css';

const AITutor = ({ selectedCourseId, content, onClose, onProgress, character }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [context, setContext] = useState([]);

  useEffect(() => {
    if (content) {
      setMessages([{ type: 'bot', content: content }]);
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      console.log('Sending request with courseId:', selectedCourseId);
      const response = await fetch('http://localhost:5000/api/ai-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          question: input,
          courseId: selectedCourseId,
          isInitialGreeting: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      setIsThinking(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: data.response,
        isNew: true 
      }]);
      
      onProgress(10);

    } catch (error) {
      console.error('Error in AI Tutor:', error);
      setIsThinking(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: `I'm sorry, I encountered an error. Please try again later.`,
        isError: true 
      }]);
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
