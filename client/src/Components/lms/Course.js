import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Course.css';
import { useSidebar } from '../../context/SidebarContext';
import Sidebar from '../layout/Sidebar';
import AITutor from './AITutor'; // We'll create this component

const Course = () => {
  const { slug } = useParams();
  const { isCollapsed } = useSidebar();
  const [currentPresentationIndex, setCurrentPresentationIndex] = useState(0);
  const [showAITutor, setShowAITutor] = useState(false);
  const [aiTutorContent, setAiTutorContent] = useState('');
  const [presentationContent, setPresentationContent] = useState('');

  const presentations = [
    {
      id: 1, // Add this
      title: "Mi'kmaq Language Course",
      url: "https://www.canva.com/design/DAGIfv3-5KA/5hifco69hG0bQdGUX1Fblg/view?embed"
    },
    {
      id: 2, // Add this
      title: "Cybersecurity Fundamentals",
      url: "https://www.canva.com/design/DAFeBQY715M/gwuY718YlAwRM8BZ-7RPiw/view?embed"
    }
  ];

  useEffect(() => {
    const fetchPresentationContent = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/presentation-content/${presentations[currentPresentationIndex].id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPresentationContent(data.content);
        setAiTutorContent(data.content);
      } catch (error) {
        console.error('Error fetching presentation content:', error);
      }
    };

    fetchPresentationContent();
  }, [currentPresentationIndex]);

  const handleNextPresentation = () => {
    setCurrentPresentationIndex((prevIndex) =>
      Math.min(prevIndex + 1, presentations.length - 1)
    );
  };

  const handlePrevPresentation = () => {
    setCurrentPresentationIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const toggleAITutor = () => {
    setShowAITutor(!showAITutor);
  };

  return (
    <div className={`lms-container ${isCollapsed ? '' : 'sidebar-expanded'}`}>
      <div className="course-wrapper">
        <nav className="course-navigation">
          <h2>Presentations</h2>
          <ul>
            {presentations.map((presentation, index) => (
              <li
                key={index}
                className={index === currentPresentationIndex ? 'active' : ''}
                onClick={() => setCurrentPresentationIndex(index)}
              >
                {presentation.title}
              </li>
            ))}
          </ul>
        </nav>
        <div className="course-container">
          <main className="course-content">
            <div className="presentation-container current-presentation">
              <h3>{presentations[currentPresentationIndex].title}</h3>
              <div className="presentation-content">
                <iframe
                  src={presentations[currentPresentationIndex].url}
                  frameBorder="0"
                  allowFullScreen
                  title={presentations[currentPresentationIndex].title}
                ></iframe>
              </div>
            </div>
            <div className="presentation-controls">
              <button onClick={handlePrevPresentation} disabled={currentPresentationIndex === 0}>Previous</button>
              <button onClick={handleNextPresentation} disabled={currentPresentationIndex === presentations.length - 1}>Next</button>
              <button onClick={toggleAITutor}>
                {showAITutor ? 'Hide AI Tutor' : 'Show AI Tutor'}
              </button>
            </div>
          </main>
        </div>
      </div>

      {showAITutor && (
        <AITutor content={aiTutorContent} onClose={toggleAITutor} />
      )}
    </div>
  );
};

export default Course;