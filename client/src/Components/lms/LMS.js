import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import Sidebar from '../layout/Sidebar';
import ExcelChatBot from '../pipinami/ExcelChatBot';
import './lms.css';

const LMS = () => {
  const { isCollapsed } = useSidebar();
  const [courses, setCourses] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPathwayModalOpen, setIsPathwayModalOpen] = useState(false);
  const [careerChoice, setCareerChoice] = useState('');
  const [generatedPathway, setGeneratedPathway] = useState(null);
  const navigate = useNavigate();

  const toggleChatbot = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleGeneratePathway = (e) => {
    e.preventDefault();
    // Add pathway generation logic here
    setIsPathwayModalOpen(false);
  };

  const categories = [
    { name: 'All', color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { name: 'Science', color: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
    { name: 'Technology', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { name: 'Engineering', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { name: 'Mathematics', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`, { state: { courseId } });
  };

  return (
    <div className="lms-page">
      <Sidebar />
      <div className={`lms-main-content ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <div className="lms-header">
          <h1>Learning Management System</h1>
          <p>Welcome back! Continue your learning journey.</p>
        </div>

        <div className="categories-section">
          <div className="categories-scroll">
            {categories.map((category, index) => (
              <button
                key={index}
                className="category-button"
                style={{ background: category.color }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="actions-grid">
          <div className="action-card tutor" onClick={() => handleCourseClick(courses[0]?._id)}>
            <h3>AI Tutor</h3>
            <small>Get personalized learning assistance</small>
          </div>
          <div className="action-card pathway" onClick={() => setIsPathwayModalOpen(true)}>
            <h3>Career Pathway</h3>
            <small>Generate your learning path</small>
          </div>
          <div className="action-card add-course">
            <h3>Add Course</h3>
            <small>Create new learning content</small>
          </div>
          <div className="action-card bursary">
            <h3>Bursary</h3>
            <small>Apply for financial support</small>
          </div>
        </div>

        <div className="courses-grid">
          {courses.map((course) => (
            <div
              key={course._id}
              className="course-card"
              onClick={() => handleCourseClick(course._id)}
            >
              <div className="course-image">
                {/* Add course image here */}
              </div>
              <div className="course-info">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span>👨‍🏫 {course.instructor}</span>
                  <span>⏱️ {course.duration}</span>
                  <span>📚 {course.level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat button */}
        <button className="solid-chat-button glass-chat-button" onClick={toggleChatbot}>
          Pipanimi – Ask me
        </button>

        {/* Chat modal */}
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
