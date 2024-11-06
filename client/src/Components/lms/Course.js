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

  if (!courseData) {
    return <div>Loading...</div>;
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
              {['Presentation', 'Course Material'].map((tab, index) => (
                <button
                  key={tab}
                  className={currentPresentationIndex === index ? 'active' : ''}
                  onClick={() => setCurrentPresentationIndex(index)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="presentation-viewer">
              {currentPresentationIndex === 0 && courseData?.canvaLink && (
                <div className="canva-container">
                  <iframe
                    className="canva-embed"
                    src={`${courseData.canvaLink.split('?')[0]}?embed`}
                    allowFullScreen
                    allow="fullscreen"
                    loading="lazy"
                    title="Canva Presentation"
                  />
                </div>
              )}
              {currentPresentationIndex === 1 && courseData?.pdfPath && (
                <div className="pdf-viewer">
                  <h3>Course Material</h3>
                  {/* PDF viewer component */}
                </div>
              )}
            </div>
          </div>

          <div className="ai-tutor-panel">
            <div className="tutor-character">
              <div className="tutor-avatar">
                {tutorCharacter.emoji}
                {tutorCharacter.streakCount > 0 && (
                  <div className="streak-badge">
                    🔥 {tutorCharacter.streakCount} day streak!
                  </div>
                )}
              </div>
              <div className="tutor-info">
                <h3>{tutorCharacter.name}</h3>
                <div className="tutor-stats">
                  <div className="level-badge">Level {tutorCharacter.level}</div>
                  <div className="experience-bar">
                    <div 
                      className="experience-fill" 
                      style={{ width: `${tutorCharacter.experience}%` }}
                    />
                  </div>
                </div>
                <div className="badges-container">
                  {tutorCharacter.badges.map((badge, index) => (
                    <span key={index} className="badge" title={badge.name}>
                      {badge.emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="ai-tutor-content">
              <AITutor
                selectedCourseId={selectedCourseId}
                content={aiTutorContent}
                onClose={toggleAITutor}
                onProgress={updateTutorProgress}
                character={tutorCharacter}
                onResponse={handleStudentResponse}
                hasAnswered={hasAnswered}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;
