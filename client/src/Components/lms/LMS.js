import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import Sidebar from '../layout/Sidebar';
import ExcelChatBot from '../pipinami/ExcelChatBot';
import './lms.css';

const LMS = () => {
  const { isCollapsed } = useSidebar();
  const [courses, setCourses] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPathwayModalOpen, setIsPathwayModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'All',
    instructor: '',
    duration: '',
    level: 'Beginner',
    pdfFile: null,
    pptxPath: '',
  });
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

  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description);
      formData.append('category', newCourse.category);
      formData.append('instructor', newCourse.instructor);
      formData.append('duration', newCourse.duration);
      formData.append('level', newCourse.level);
      formData.append('pptxPath', newCourse.pptxPath);
      
      if (newCourse.pdfFile) {
        formData.append('pdf', newCourse.pdfFile);
      }

      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const result = await response.json();
      setCourses([...courses, result.course]);
      setIsAddCourseModalOpen(false);
      setNewCourse({
        title: '',
        description: '',
        category: 'All',
        instructor: '',
        duration: '',
        level: 'Beginner',
        pdfFile: null,
        pptxPath: '',
      });
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'pdfFile') {
        setNewCourse(prev => ({
          ...prev,
          pdfFile: files[0]
        }));
      }
    } else {
      setNewCourse(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const categories = [
    { 
      name: 'All', 
      color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'
    },
    { 
      name: 'Science', 
      color: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31'
    },
    { 
      name: 'Technology', 
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475'
    },
    { 
      name: 'Engineering', 
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12'
    },
    { 
      name: 'Mathematics', 
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb'
    }
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
          <div className="action-card add-course" onClick={() => setIsAddCourseModalOpen(true)}>
            <h3>Add Course</h3>
            <small>Create new learning content</small>
          </div>
          <div className="action-card bursary">
            <h3>Bursary</h3>
            <small>Apply for financial support</small>
          </div>
          <Link to="/admin" className="action-card analytics">
            <h3>Analytics</h3>
            <small>View learning insights</small>
          </Link>
        </div>

        <div className="courses-grid">
          {courses.map((course) => {
            const category = categories.find(cat => cat.name === course.category) || categories[0];
            return (
              <div
                key={course._id}
                className="course-card"
                onClick={() => handleCourseClick(course._id)}
              >
                <div 
                  className="course-image"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${category.image}?auto=format&fit=crop&w=800&q=80)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <h3 className="course-title">{course.title}</h3>
                </div>
                <div className="course-info">
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span>👨‍🏫 {course.instructor}</span>
                    <span>⏱️ {course.duration}</span>
                    <span>📚 {course.level}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Course Modal */}
        {isAddCourseModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Create New Course</h2>
              <form onSubmit={handleAddCourse}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newCourse.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={newCourse.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={newCourse.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Instructor</label>
                  <input
                    type="text"
                    name="instructor"
                    value={newCourse.instructor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={newCourse.duration}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2 hours, 4 weeks"
                  />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select
                    name="level"
                    value={newCourse.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Course Material (PDF)</label>
                  <input
                    type="file"
                    name="pdfFile"
                    accept=".pdf"
                    onChange={handleInputChange}
                    required
                  />
                  <small className="file-hint">Upload a PDF file containing the course material. This will be used by the AI Tutor.</small>
                </div>
                <div className="form-group">
                  <label>PowerPoint Presentation (OneDrive Embed Code)</label>
                  <input
                    type="text"
                    name="pptxPath"
                    value={newCourse.pptxPath}
                    onChange={handleInputChange}
                    placeholder="Paste the entire iframe embed code or direct OneDrive link"
                  />
                  <small className="file-hint">
                    To get the embed code:
                    1. Upload your PowerPoint to OneDrive.com
                    2. Right-click the file and select "Share"
                    3. Click "Embed" at the top of the share dialog
                    4. Click "Generate"
                    5. Copy the ENTIRE iframe code and paste it here
                    
                    OR alternatively:
                    - Just paste the direct OneDrive link (https://1drv.ms/p/s!...)
                    
                    Both formats will work!
                  </small>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="submit-btn">Create Course</button>
                  <button type="button" className="cancel-btn" onClick={() => setIsAddCourseModalOpen(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

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

