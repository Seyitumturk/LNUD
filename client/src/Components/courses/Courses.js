import React, { useState } from 'react';
import { /* other imports */ } from '@mui/material';
import Sidebar from '../layout/Sidebar';
import ExcelChatBot from '../pipinami/ExcelChatBot'; // Import the ChatBot component
import './courses.css'; // Make sure to import the CSS file

const Courses = () => {
  // ... existing state and functions ...

  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChatbot = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="courses-container">
      <Sidebar />
      <div className="courses-content">
        {/* Existing courses content */}
        
        {/* Add the chat button */}
        <button
          className="solid-chat-button glass-chat-button"
          onClick={toggleChatbot}
        >
          Pipanimi – Ask me
        </button>

        {/* Add the chat modal */}
        {isChatOpen && (
          <div className="chat-modal">
            <div className="chat-modal-content">
              <ExcelChatBot isOpen={isChatOpen} toggleChatbot={toggleChatbot} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;