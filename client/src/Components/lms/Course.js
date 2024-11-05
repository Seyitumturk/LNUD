// Course.js (Updated to Display Screenshot for Debugging)
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
  const [showAITutor, setShowAITutor] = useState(true);
  const [aiTutorContent, setAiTutorContent] = useState('');
  const [courseData, setCourseData] = useState(null);
  const location = useLocation();
  const selectedCourseId = location.state?.courseId;

  const [tutorCharacter, setTutorCharacter] = useState({
    name: 'Pipi',
    mood: 'happy',
    experience: 0,
    level: 1
  });

  const updateTutorProgress = (points) => {
    setTutorCharacter(prev => {
      const newExperience = prev.experience + points;
      const newLevel = Math.floor(newExperience / 100) + 1;
      return {
        ...prev,
        experience: newExperience % 100,
        level: newLevel,
        mood: points > 0 ? 'excited' : 'thinking'
      };
    });
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/courses/${selectedCourseId}`);
        const data = await response.json();
        setCourseData(data);
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
    setAiTutorContent(prompt);
    setShowAITutor(true);
  };

  if (!courseData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="course-page">
      <Sidebar />
      
      <div className="course-main-content">
        <div className="course-header">
          <h1>{courseData?.title}</h1>
          <div className="course-meta">
            <span className="instructor">👨‍🏫 {courseData?.instructor}</span>
            <span className="duration">⏱️ {courseData?.duration}</span>
            <span className="level">📚 {courseData?.level}</span>
          </div>
        </div>

        <div className="course-content-wrapper">
          <div className="presentation-section">
            <div className="presentation-tabs">
              <button 
                className={currentPresentationIndex === 0 ? 'active' : ''}
                onClick={() => setCurrentPresentationIndex(0)}
              >
                Canva Presentation
              </button>
              <button 
                className={currentPresentationIndex === 1 ? 'active' : ''}
                onClick={() => setCurrentPresentationIndex(1)}
              >
                Course Material
              </button>
            </div>

            <div className="presentation-viewer">
              {currentPresentationIndex === 0 && courseData?.canvaLink && (
                <iframe
                  src={courseData.canvaLink.includes('?embed') ? 
                    courseData.canvaLink : 
                    `${courseData.canvaLink}/embed`}
                  frameBorder="0"
                  allowFullScreen
                  title="Canva Presentation"
                  className="canva-presentation"
                  allow="fullscreen"
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '500px'
                  }}
                />
              )}
              {currentPresentationIndex === 1 && courseData?.pdfPath && (
                <div className="pdf-viewer">
                  <h3>Course Material</h3>
                  {/* Add PDF viewer component here */}
                </div>
              )}
            </div>
          </div>

          <div className="ai-tutor-section">
            <div className="tutor-character">
              <div className={`tutor-avatar ${tutorCharacter.mood}`}>
                {/* Add your tutor character image/animation here */}
              </div>
              <div className="tutor-stats">
                <div className="level-badge">Level {tutorCharacter.level}</div>
                <div className="experience-bar">
                  <div 
                    className="experience-fill" 
                    style={{ width: `${tutorCharacter.experience}%` }}
                  />
                </div>
              </div>
            </div>

            <AITutor
              selectedCourseId={selectedCourseId}
              content={aiTutorContent}
              onClose={toggleAITutor}
              onProgress={updateTutorProgress}
              character={tutorCharacter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
