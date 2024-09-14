import React, { useState } from 'react';
import { /* other imports */ } from '@mui/material';
import Sidebar from '../layout/Sidebar';
import ExcelChatBot from '../pipinami/ExcelChatBot'; // Import the ChatBot component
import './lms.css'; // Make sure to import the CSS file

const CourseCard = ({ title, instructor, duration, level, description, featured, progress, bgImage }) => (
  <div className={`course-card ${featured ? 'featured' : ''}`} style={{ backgroundImage: `url(${bgImage})` }}>
    <div className="course-card-overlay"></div>
    <div className="course-card-content">
      {featured && <div className="featured-badge">Featured</div>}
      <h3 className="course-title">{title}</h3>
      <p className="course-instructor">Instructor: {instructor}</p>
      <p className="course-duration">Duration: {duration}</p>
      <p className="course-level">Level: {level}</p>
      <p className="course-description">{description}</p>
      {progress !== undefined && (
        <div className="course-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">{progress}% Complete</span>
        </div>
      )}
    </div>
    <button className="enroll-button">{progress !== undefined ? 'Continue' : 'Enroll Now'}</button>
  </div>
);

const LMS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChatbot = () => setIsChatOpen(!isChatOpen);

  const courses = [
    { id: 1, title: "Introduction to Mi'kmaq Language", instructor: "Dr. Emily Johnson", duration: "8 weeks", level: "Beginner", description: "Learn the basics of Mi'kmaq language and culture.", featured: true, bgImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 2, title: "Advanced Sustainable Fishing Practices", instructor: "Prof. Michael Smith", duration: "12 weeks", level: "Advanced", description: "Explore cutting-edge sustainable fishing techniques.", progress: 75, bgImage: "https://images.unsplash.com/photo-1545816250-e12bedba42ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 3, title: "Traditional Medicinal Plants", instructor: "Elder Sarah Denny", duration: "6 weeks", level: "Intermediate", description: "Discover the healing properties of indigenous plants.", bgImage: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 4, title: "Cultural Preservation Techniques", instructor: "Dr. Robert White", duration: "10 weeks", level: "All Levels", description: "Learn methods to preserve and promote indigenous culture.", bgImage: "https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 5, title: "Indigenous Art and Storytelling", instructor: "Maria Running Wolf", duration: "8 weeks", level: "Beginner", description: "Explore traditional art forms and storytelling techniques.", bgImage: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 6, title: "Environmental Stewardship", instructor: "Dr. John River", duration: "10 weeks", level: "Intermediate", description: "Learn about environmental conservation from an indigenous perspective.", progress: 30, bgImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterLevel === 'All' || course.level === filterLevel)
  );

  return (
    <div className="lms-container">
      <Sidebar />
      <div className="lms-content">
        <h1 className="lms-title">Learning Management System</h1>
        <div className="lms-controls">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="level-filter"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
        
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

export default LMS;