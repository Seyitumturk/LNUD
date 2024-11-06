// AITutor.js
import React, { useState, useEffect, useRef } from 'react';
import './AITutor.css';

const TypeWriter = ({ content }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 20); // Adjust speed here
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, content]);
  
  return <div>{displayedContent}</div>;
};

const AITutor = ({ selectedCourseId, content, onClose, onProgress, character }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (content) {
      setMessages([{ type: 'bot', content, isNew: true }]);
    }
  }, [content]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
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
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: data.response,
        isNew: true 
      }]);
      
      onProgress(10);

    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: "I'm sorry, I encountered an error. Please try again later.",
        isError: true 
      }]);
    }
  };

  return (
    <div className="ai-tutor-container">
      <div className="ai-tutor-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.type === 'bot' && (
              <div className="bot-avatar">
                {/* Add your bot avatar image here */}
              </div>
            )}
            <div className="message-content">
              {message.isNew && message.type === 'bot' ? (
                <TypeWriter content={message.content} />
              ) : (
                message.content
              )}
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
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-tutor-input-container">
        <input
          type="text"
          className="ai-tutor-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button 
          className="ai-tutor-send-button"
          onClick={handleSubmit}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AITutor;
