// AITutor.js
import React, { useState, useEffect, useRef } from 'react';
import './AITutor.css';

const TypeWriter = ({ content }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    // Scroll to bottom whenever displayedContent changes
    const scrollToBottom = () => {
      window.requestAnimationFrame(() => {
        const messages = document.querySelector('.ai-tutor-messages');
        if (messages) {
          messages.scrollTop = messages.scrollHeight;
        }
      });
    };
    
    scrollToBottom();
  }, [displayedContent]); // Dependency on displayedContent ensures scroll on each update
  
  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 10);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, content]);
  
  // Process text to add highlights and underlines
  const processText = (text) => {
    // First, split the text into paragraphs
    const paragraphs = text.split('\n').filter(Boolean);
    
    return paragraphs.map((paragraph, pIndex) => {
      // Check if it's a bullet point
      if (paragraph.trim().startsWith('- ')) {
        return (
          <li key={pIndex} className="chat-bullet-point">
            {processSegments(paragraph.substring(2))}
          </li>
        );
      }
      
      // Check if it's a numbered point
      if (/^\d+\.\s/.test(paragraph)) {
        return (
          <div key={pIndex} className="chat-numbered-point">
            {processSegments(paragraph)}
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={pIndex} className="chat-paragraph">
          {processSegments(paragraph)}
        </p>
      );
    });
  };
  
  // Helper function to process text segments with highlights and underlines
  const processSegments = (text) => {
    const segments = text.split(/(\*\*.*?\*\*)|(__.*?__)/g).filter(Boolean);
    let highlightColorIndex = 0;
    const highlightColors = [
      'highlight-yellow',
      'highlight-blue',
      'highlight-green',
      'highlight-purple'
    ];
    
    return segments.map((segment, index) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        // Rotate through highlight colors
        const colorClass = highlightColors[highlightColorIndex % highlightColors.length];
        highlightColorIndex++;
        return (
          <span key={index} className={`highlight ${colorClass}`}>
            {segment.slice(2, -2)}
          </span>
        );
      } else if (segment.startsWith('__') && segment.endsWith('__')) {
        return (
          <span key={index} className="underline">
            {segment.slice(2, -2)}
          </span>
        );
      }
      return segment;
    });
  };
  
  return (
    <div className="chat-content">
      {processText(displayedContent)}
      {currentIndex < content.length && <span className="typing-cursor" />}
    </div>
  );
};

const AITutor = ({ selectedCourseId, content, onClose, onProgress, onResponse, hasAnswered, initialHistory }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate a unique session ID when the component mounts
    setSessionId(Math.random().toString(36).substring(7));
    
    // Initialize messages with chat history if available
    if (initialHistory && initialHistory.length > 0) {
      setMessages(initialHistory.map(msg => ({
        type: msg.role === 'assistant' ? 'bot' : 'user',
        content: msg.content,
        isNew: false
      })));
    }
  }, [initialHistory]);

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
          isInitialGreeting: false,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      // Process the response to add formatting markers
      let formattedResponse = data.response;
      
      // Add highlights to important terms (you can customize these patterns)
      formattedResponse = formattedResponse.replace(
        /\b(important|note|key concept|remember|crucial|essential|significant)\b/gi,
        '**$1**'
      );
      
      // Add underlines to definitions or key phrases
      formattedResponse = formattedResponse.replace(
        /(is defined as|means|refers to|is called)/gi,
        '__$1__'
      );

      setIsTyping(false);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: formattedResponse,
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
      <div className="tutor-character">
        <div className="bot-avatar">
          <span>🤖</span>
        </div>
        <div className="tutor-info">
          <div className="tutor-name">Pipi</div>
          <div className="tutor-status">AI Learning Assistant</div>
        </div>
      </div>
      
      <div className="ai-tutor-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.type} ${message.isNew ? 'new' : ''}`}
          >
            {message.type === 'bot' && message.isNew ? (
              <TypeWriter content={message.content} />
            ) : (
              <div className="message-content">
                {message.content}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-tutor-input-wrapper">
        <form className="ai-tutor-input-container" onSubmit={handleSubmit}>
          <input
            type="text"
            className="ai-tutor-input"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <button 
            type="submit"
            className="ai-tutor-send-button"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutor;
