import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Course.css';
import { useSidebar } from '../../context/SidebarContext';
import Sidebar from '../layout/Sidebar';
import AITutor from './AITutor';

const Course = () => {
  const { slug } = useParams();
  const { isCollapsed } = useSidebar();
  const [currentPresentationIndex, setCurrentPresentationIndex] = useState(0);
  const [showAITutor, setShowAITutor] = useState(true); // Automatically show AI Tutor on load
  const [aiTutorContent, setAiTutorContent] = useState('');
  const [courseData, setCourseData] = useState(null);
  const location = useLocation();
  const selectedCourseId = location.state?.courseId;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/courses/${selectedCourseId}`);
        const data = await response.json();
        setCourseData(data);

        // Trigger AI Tutor when course is fetched
        handleAiTutorIntroduction(data.title);
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    if (selectedCourseId) {
      fetchCourse();
    }
  }, [selectedCourseId]);

  const handleNextPresentation = () => {
    setCurrentPresentationIndex((prevIndex) =>
      Math.min(prevIndex + 1, courseData.presentations.length - 1)
    );
  };

  const handlePrevPresentation = () => {
    setCurrentPresentationIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const toggleAITutor = () => {
    setShowAITutor(!showAITutor);
  };

  const handleAiTutorIntroduction = (courseTitle) => {
    const prompt = `
      Hey there! 😊 Welcome to "${courseTitle}".
      I'm your friendly AI tutor, ready to guide you through the course material and make learning fun and easy.
      You can start by exploring the PDF course material—it's packed with all the info you'll need! 
      Feel free to ask me anything about the course or if you're curious about something else, I'm here to help!
      Let's start this learning adventure together!
    `;
    setAiTutorContent(prompt);  // Set the AI tutor's initial conversation content
    setShowAITutor(true);  // Make sure the tutor pops up
  };


  if (!courseData) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`lms-container ${isCollapsed ? '' : 'sidebar-expanded'}`}>
      <div className="course-wrapper">
        <nav className="course-navigation">
          <h2>Presentations</h2>
          <ul>
            <li
              className={currentPresentationIndex === 0 ? 'active' : ''}
              onClick={() => setCurrentPresentationIndex(0)}
            >
              {courseData.title} (Canva Presentation)
            </li>
            {courseData.pdfPath && (
              <li
                className={currentPresentationIndex === 1 ? 'active' : ''}
                onClick={() => setCurrentPresentationIndex(1)}
              >
                PDF Course Material
              </li>
            )}
          </ul>
        </nav>
        <div className="course-container">
          <main className="course-content">
            <div className="presentation-container current-presentation">
              {currentPresentationIndex === 0 && courseData.canvaLink && (
                <>
                  <h3>{courseData.title} (Canva Presentation)</h3>
                  <div className="presentation-content">
                    <iframe
                      src={courseData.canvaLink}
                      frameBorder="0"
                      allowFullScreen
                      title={courseData.title}
                    ></iframe>
                  </div>
                </>
              )}
              {currentPresentationIndex === 1 && courseData.pdfPath && (
                <>
                  <h3>{courseData.title} (PDF Course Material)</h3>
                  <div className="presentation-content">
                    <p>PDF content for this course will be discussed by the AI tutor.</p>
                  </div>
                </>
              )}
            </div>
            <div className="presentation-controls">
              <button
                onClick={handlePrevPresentation}
                disabled={currentPresentationIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={handleNextPresentation}
                disabled={
                  currentPresentationIndex ===
                  (courseData.pdfPath ? 1 : 0)
                }
              >
                Next
              </button>
              <button onClick={toggleAITutor}>
                {showAITutor ? 'Hide AI Tutor' : 'Show AI Tutor'}
              </button>
            </div>
          </main>
        </div>
      </div>

      {showAITutor && (
        <AITutor
          selectedCourseId={selectedCourseId}
          content={aiTutorContent}
          onClose={toggleAITutor}
        />
      )}
    </div>
  );
};

export default Course;
