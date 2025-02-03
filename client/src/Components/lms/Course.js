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
  const [currentView, setCurrentView] = useState('powerpoint');
  const [isLoading, setIsLoading] = useState(true);

  const [tutorCharacter, setTutorCharacter] = useState({
    name: 'Pipi',
    mood: 'happy',
    emoji: '🦊',
    experience: 0,
    level: 1,
    streakCount: 0,
    badges: [],
  });

  const [learningPrompts, setLearningPrompts] = useState([]);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);

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

  const generateLearningPrompts = (courseTitle) => {
    const defaultPrompts = [
      "What do you already know about this topic? 🤔",
      "What questions do you have about what we're learning? 🌟",
      "How would you explain this to a friend? 🗣️",
      "Can you think of a real-world example of this? 🌍",
      "What's the most interesting thing you've learned so far? ✨"
    ];

    setLearningPrompts(defaultPrompts);
  };

  const handleAiTutorIntroduction = (courseTitle) => {
    const prompt = `
      Hey there, friend! 🦊 

      I'm ${tutorCharacter.name}, your learning buddy for "${courseTitle}"! 
      
      I'm super excited to explore this topic with you! Here's what we can do together:
      
      🎯 Learn cool new things
      💭 Think about interesting questions
      🌟 Earn badges and level up
      
      Ready for an adventure? Let's start with a fun question:
      ${learningPrompts[0]}
    `;
    
    setAiTutorContent(prompt);
    generateLearningPrompts(courseTitle);
    setShowAITutor(true);
  };

  const handleStudentResponse = (response) => {
    setHasAnswered(true);
    updateTutorProgress(10);
    
    const feedback = [
      "That's a great thought! 🌟",
      "Interesting perspective! 💡",
      "You're doing amazing! 🎉",
      "Keep going, you're on fire! 🔥"
    ];
    
    const nextPrompt = `
      ${feedback[Math.floor(Math.random() * feedback.length)]}
      
      Let's think about this:
      ${learningPrompts[currentPromptIndex + 1]}
    `;
    
    setAiTutorContent(nextPrompt);
    setCurrentPromptIndex(prev => prev + 1);
  };

  const formatOneDriveUrl = (url) => {
    if (!url) return '';
    
    console.log('Original URL:', url);

    try {
      // Handle the case where the full iframe code is pasted
      if (url.includes('<iframe')) {
        // Extract the URL from src attribute
        const srcMatch = url.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
          console.log('Extracted URL from iframe:', srcMatch[1]);
          // Replace HTML entities and return the clean URL
          return srcMatch[1].replace(/&amp;/g, '&');
        }
      }

      // Handle direct 1drv.ms links
      if (url.includes('1drv.ms')) {
        // Ensure the embed parameters are added
        if (!url.includes('embed=1')) {
          const separator = url.includes('?') ? '&' : '?';
          return `${url}${separator}embed=1&em=2`;
        }
        return url;
      }

      // Return the URL as is if none of the above conditions match
      return url;
    } catch (error) {
      console.error('Error formatting OneDrive URL:', error);
      return url;
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course with ID:', selectedCourseId); // Debug log
        const response = await fetch(`http://localhost:5000/api/courses/${selectedCourseId}`);
        const data = await response.json();
        console.log('Fetched course data:', data); // Debug log
        setCourseData(data);
        handleAiTutorIntroduction(data.title);
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };

    if (selectedCourseId) {
      fetchCourse();
    } else {
      console.log('No courseId provided'); // Debug log
    }
  }, [selectedCourseId]);

  useEffect(() => {
    console.log('Current courseData:', courseData);
  }, [courseData]);

  if (!courseData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white' 
      }}>
        Loading course data...
      </div>
    );
  }

  return (
    <div className="course-page">
      <Sidebar />
      
      <div className={`course-main-content ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <div className="course-header">
          <div className="header-content">
            <h1>{courseData?.title}</h1>
            <div className="course-meta">
              <span className="instructor">👨‍🏫 {courseData?.instructor}</span>
              <span className="duration">⏱️ {courseData?.duration}</span>
              <span className="level">📚 {courseData?.level}</span>
            </div>
          </div>
        </div>

        <div className="course-content-layout">
          <div className="main-presentation-area">
            <div className="presentation-tabs">
              {['PowerPoint', 'Course Material'].map((tab, index) => (
                <button
                  key={tab}
                  className={currentView === tab.toLowerCase() ? 'active' : ''}
                  onClick={() => setCurrentView(tab.toLowerCase())}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="presentation-viewer">
              {currentView === 'powerpoint' && (
                <div className="powerpoint-container">
                  {isLoading && <div className="loading-message">Loading presentation...</div>}
                  {courseData?.pptxPath ? (
                    <div className="powerpoint-wrapper">
                      <iframe
                        src={formatOneDriveUrl(courseData.pptxPath)}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        allowFullScreen={true}
                        title="PowerPoint Presentation"
                        loading="lazy"
                        onLoad={(e) => {
                          console.log('PowerPoint iframe loaded:', e.target.src);
                          setIsLoading(false);
                        }}
                        onError={(e) => {
                          console.error('PowerPoint loading error:', e);
                          setIsLoading(false);
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ color: '#666', padding: '2rem' }}>
                      No PowerPoint presentation available for this course
                    </div>
                  )}
                </div>
              )}
              {currentView === 'course material' && (
                <div className="pdf-viewer" style={{ 
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  padding: '0',
                  margin: '0'
                }}>
                  {courseData?.pdfPath ? (
                    <iframe
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/pdf/${courseData._id}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title="Course Material PDF"
                      style={{ 
                        minHeight: '600px',
                        maxWidth: '100%',
                        border: 'none',
                        margin: '0',
                        padding: '0',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <div style={{ color: '#666', padding: '2rem' }}>
                      No course material available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="ai-tutor-sidebar">
            <AITutor
              selectedCourseId={selectedCourseId}
              content={aiTutorContent}
              onClose={toggleAITutor}
              onProgress={updateTutorProgress}
              onResponse={handleStudentResponse}
              hasAnswered={hasAnswered}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
