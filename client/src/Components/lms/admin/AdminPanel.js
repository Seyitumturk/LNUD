import React, { useState, useEffect } from 'react';
import { useSidebar } from '../../../context/SidebarContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isCollapsed } = useSidebar();
  const [selectedTranscript, setSelectedTranscript] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchTranscripts(selectedCourse._id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const fetchTranscripts = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat-transcripts/${courseId}`);
      const data = await response.json();
      setTranscripts(data);
    } catch (error) {
      console.error('Error fetching transcripts:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const renderAnalytics = (transcript) => {
    const { aiAnalysis } = transcript;
    return (
      <div className="analytics-section">
        <h3>AI Analysis</h3>
        <div className="analytics-grid">
          <div className="analytics-item">
            <h4>Comprehension Level</h4>
            <span className={`level-badge ${aiAnalysis.comprehensionLevel.toLowerCase()}`}>
              {aiAnalysis.comprehensionLevel}
            </span>
          </div>
          <div className="analytics-item">
            <h4>Engagement Score</h4>
            <div className="engagement-meter">
              <div 
                className="engagement-fill" 
                style={{ width: `${aiAnalysis.engagementScore * 10}%` }}
              />
              <span>{aiAnalysis.engagementScore}/10</span>
            </div>
          </div>
          <div className="analytics-item">
            <h4>Key Topics Discussed</h4>
            <div className="topics-list">
              {aiAnalysis.keyTopics.map((topic, index) => (
                <span key={index} className="topic-tag">{topic}</span>
              ))}
            </div>
          </div>
          <div className="analytics-item">
            <h4>Suggested Focus Areas</h4>
            <ul className="focus-areas-list">
              {aiAnalysis.suggestedFocusAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`admin-panel ${!isCollapsed ? 'sidebar-expanded' : ''}`}>
      <div className="admin-header">
        <h1>Course Analytics Dashboard</h1>
        <p>Monitor student-AI interactions and learning progress</p>
      </div>

      <div className="admin-content">
        <div className="courses-section">
          <h2>Courses</h2>
          {loading ? (
            <p>Loading courses...</p>
          ) : (
            <div className="course-list">
              {courses.map(course => (
                <div
                  key={course._id}
                  className={`course-item ${selectedCourse?._id === course._id ? 'selected' : ''}`}
                  onClick={() => setSelectedCourse(course)}
                >
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCourse && (
          <div className="transcripts-section">
            <h2>Chat Transcripts - {selectedCourse.title}</h2>
            <div className="transcripts-list">
              {transcripts.map(transcript => (
                <div key={transcript._id} className="transcript-item">
                  <div className="transcript-header">
                    <h3>Session {transcript.sessionId}</h3>
                    <span className="transcript-date">{formatDate(transcript.createdAt)}</span>
                  </div>
                  
                  {renderAnalytics(transcript)}

                  <div className="chat-messages">
                    <h4>Conversation</h4>
                    {transcript.messages.map((message, index) => (
                      <div key={index} className={`message ${message.role}`}>
                        <span className="message-role">{message.role === 'assistant' ? '🦊 Pipi' : '👤 Student'}</span>
                        <p>{message.content}</p>
                        <span className="message-time">{formatDate(message.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 