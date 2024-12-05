import React, { useState, useEffect } from 'react';
import { Button, Modal, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Sidebar from '../layout/Sidebar';
import ExcelChatBot from '../pipinami/ExcelChatBot';
import AddIcon from '@mui/icons-material/Add';
import RouteIcon from '@mui/icons-material/Route';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import './lms.css';
import { useSidebar } from '../../context/SidebarContext';
import { Link } from 'react-router-dom';

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const getCourseIcon = (category) => {
  const icons = {
    technology: (
      <svg className="course-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H16L12,22L8,18H4A2,2 0 0,1 2,16V4A2,2 0 0,1 4,2M4,4V16H8.83L12,19.17L15.17,16H20V4H4M6,7H18V9H6V7M6,11H16V13H6V11Z" />
      </svg>
    ),
    science: (
      <svg className="course-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M5,19A1,1 0 0,0 6,20H18A1,1 0 0,0 19,19C19,18.79 18.93,18.59 18.82,18.43L13,8.35V4H11V8.35L5.18,18.43C5.07,18.59 5,18.79 5,19M6,22A3,3 0 0,1 3,19C3,18.4 3.18,17.84 3.5,17.37L9,7.81V6A1,1 0 0,1 8,5V4A2,2 0 0,1 10,2H14A2,2 0 0,1 16,4V5A1,1 0 0,1 15,6V7.81L20.5,17.37C20.82,17.84 21,18.4 21,19A3,3 0 0,1 18,22H6M13,10A1,1 0 0,1 12,11A1,1 0 0,1 11,10A1,1 0 0,1 12,9A1,1 0 0,1 13,10Z" />
      </svg>
    ),
    engineering: (
      <svg className="course-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,15C7.58,15 4,16.79 4,19V21H20V19C20,16.79 16.42,15 12,15M8,9A4,4 0 0,0 12,13A4,4 0 0,0 16,9M11.5,2C11.2,2 11,2.21 11,2.5V5.5H10V3C10,3 7.75,3.86 7.75,6.75C7.75,7.37 8.25,7.87 8.87,7.87C9.5,7.87 10,7.37 10,6.75V5.5H11V6.75C11,7.37 11.5,7.87 12.12,7.87C12.75,7.87 13.25,7.37 13.25,6.75C13.25,3.86 11,3 11,3V2.5C11,2.21 10.79,2 10.5,2H11.5Z" />
      </svg>
    ),
    arts: (
      <svg className="course-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10A2,2 0 0,1 3,8A2,2 0 0,1 5,6A2,2 0 0,1 7,8M17,8A2,2 0 0,1 15,10A2,2 0 0,1 13,8A2,2 0 0,1 15,6A2,2 0 0,1 17,8M7,16A2,2 0 0,1 5,18A2,2 0 0,1 3,16A2,2 0 0,1 5,14A2,2 0 0,1 7,16M17,16A2,2 0 0,1 15,18A2,2 0 0,1 13,16A2,2 0 0,1 15,14A2,2 0 0,1 17,16Z" />
      </svg>
    ),
    mathematics: (
      <svg className="course-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19,4H5A2,2 0 0,0 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6A2,2 0 0,0 19,4M8,18H6V16H8V18M8,15H6V13H8V15M8,12H6V10H8V12M8,9H6V7H8V9M13,18H11V16H13V18M13,15H11V13H13V15M13,12H11V10H13V12M13,9H11V7H13V9M18,18H16V16H18V18M18,15H16V13H18V15M18,12H16V10H18V12M18,9H16V7H18V9Z" />
      </svg>
    )
  };

  // Return the icon for the category, or a default icon if category not found
  return icons[category.toLowerCase()] || (
    <svg className="course-icon" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
    </svg>
  );
};

const CourseCard = ({ title, instructor, duration, level, description, featured, progress, courseId, category, onCourseClick }) => {
  const slug = generateSlug(title);
  
  const getPortalColors = (category) => {
    const colors = {
      technology: ['#04b2d8', '#0076ff'],
      science: ['#9333ea', '#4f46e5'],
      engineering: ['#f59e0b', '#ef4444'],
      arts: ['#ec4899', '#8b5cf6'],
      mathematics: ['#10b981', '#3b82f6']
    };
    return colors[category.toLowerCase()] || ['#04b2d8', '#0076ff'];
  };

  const [portalColor1, portalColor2] = getPortalColors(category);

  return (
    <Link to={`/course/${slug}`} state={{ courseId }} className="course-card-link">
      <div 
        className={`course-card ${featured ? 'featured' : ''}`} 
        data-category={category.toLowerCase()}
        onClick={() => onCourseClick(courseId)}
        style={{
          '--portal-color-1': portalColor1,
          '--portal-color-2': portalColor2
        }}
      >
        <div className="course-card-image">
          <div className="portal-effect"></div>
          {getCourseIcon(category)}
        </div>
        {featured && (
          <span className="featured-badge">
            <svg width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
            </svg>
            Featured
          </span>
        )}
        <div className="course-card-content">
          <h3 className="course-title">{title}</h3>
          <div className="course-details">
            <span className="course-instructor">
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              {instructor}
            </span>
            <span className="course-duration">
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
              </svg>
              {duration}
            </span>
            <span className="course-level">
              <svg width="12" height="12" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
              {level}
            </span>
          </div>
          <p className="course-description">{description}</p>
          <div className="course-footer">
            {progress !== undefined && (
              <div className="course-progress">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
                <span className="progress-text">{progress}% Complete</span>
              </div>
            )}
            <button className="enroll-button">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
              </svg>
              {progress !== undefined ? 'Continue' : 'Enter Portal'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};



const LMS = () => {
  const { isCollapsed } = useSidebar();
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isPathwayModalOpen, setIsPathwayModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null); // Store the selected course ID
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    instructor: '',
    duration: '',
    level: '',
    category: '',
    description: '',
    pdf: null, // Store PDF file
    canvaLink: '', // Add Canva link state

  });
  const [careerChoice, setCareerChoice] = useState(''); // New state for career choice input
  const [generatedPathway, setGeneratedPathway] = useState(null); // New state for the generated pathway

  useEffect(() => {
    fetchCourses();  // Fetch courses when component mounts
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        console.error('Expected array of courses but received:', data);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };
  const handleCourseClick = (courseId) => {
    setSelectedCourseId(courseId); // Set the selected course ID
    setIsAITutorOpen(true); // Open the AI Tutor
  };

  const toggleChatbot = () => setIsChatOpen(!isChatOpen);


  const handleGeneratePathway = async (e) => {
    e.preventDefault();
    try {
      // Simulating an API call
      const response = await new Promise(resolve => setTimeout(() => resolve({
        pathway: [
          { id: 'course1', title: 'Introduction to ' + careerChoice },
          { id: 'course2', title: 'Advanced ' + careerChoice + ' Techniques' },
          { id: 'course3', title: careerChoice + ' in Practice' },
        ]
      }), 1000));

      setGeneratedPathway(response.pathway);
    } catch (error) {
      console.error('Error generating pathway:', error);
    }
    setIsPathwayModalOpen(false);
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newCourse.title);
    formData.append('instructor', newCourse.instructor);
    formData.append('duration', newCourse.duration);
    formData.append('level', newCourse.level);
    formData.append('category', newCourse.category);
    formData.append('description', newCourse.description);
    if (newCourse.pdf) formData.append('pdf', newCourse.pdf);  // Upload the PDF file
    if (newCourse.canvaLink) formData.append('canvaLink', newCourse.canvaLink);

    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setIsAddCourseModalOpen(false);
        setNewCourse({ title: '', instructor: '', duration: '', level: '', category: '', description: '', pdf: null, canvaLink: '' });
        fetchCourses();  // Refresh course list
      } else {
        console.error('Error adding course:', await response.json());
      }
    } catch (error) {
      console.error('Error adding course:', error);
    }
  };

  const filteredCourses = Array.isArray(courses) ? courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterLevel === 'All' || course.level === filterLevel) &&
    (filterCategory === 'All' || course.category === filterCategory)
  ) : [];

  const categories = [
    { name: 'All', color: 'var(--blue)' },
    { name: 'Science', color: 'var(--orange)' },
    { name: 'Technology', color: 'var(--yellow)' },
    { name: 'Engineering', color: 'var(--red)' },
    { name: 'Arts', color: 'var(--blue)' },
    { name: 'Mathematics', color: 'var(--orange)' }
  ];

  const services = [
    { title: "Pipanimi - My Tutor", description: "Get personalized assistance", color: "var(--dark-blue)", icon: <SchoolIcon fontSize="large" />, onClick: toggleChatbot },
    { title: "Generate Career Pathway", description: "Create a personalized learning path", color: "var(--dark-orange)", icon: <RouteIcon fontSize="large" />, onClick: () => setIsPathwayModalOpen(true) },
    { title: "Add Course", description: "Contribute to our course catalog", color: "var(--dark-yellow)", icon: <AddIcon fontSize="large" />, onClick: () => setIsAddCourseModalOpen(true) },
    { title: "Find Bursary", description: "Discover financial aid opportunities", color: "var(--purple)", icon: <SearchIcon fontSize="large" />, onClick: () => {/* Add bursary search functionality */ }, subtitle: "by Elev" },
  ];

  const handleCanvaLinkChange = (e) => {
    setNewCourse({ ...newCourse, canvaLink: e.target.value.trim() });
  };

  return (
    <div className={`lms-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="lms-content">
        <h1 className="lms-title">AI-Powered Learning Management System</h1>
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
        <div className="category-buttons">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`category-button ${filterCategory === category.name ? 'active' : ''}`}
              onClick={() => setFilterCategory(category.name)}
              style={{
                backgroundColor: category.color,
                color: 'var(--button-text-color)',
                border: 'none',
                padding: '8px 16px',
                margin: '4px',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'opacity 0.3s'
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        <h2 className="services-title">Services</h2>
        <div className="lms-actions" style={{ display: 'flex', gap: '20px' }}>
          {services.map((service, index) => (
            <div
              key={index}
              className={`action-card ${service.title === "Add Course" ? "highlight" : ""}`}
              onClick={service.onClick}
              style={{
                backgroundColor: service.color,
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                borderRadius: '15px',
                padding: '20px',
                color: 'white',
                textAlign: 'center',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                flex: '1',
                minWidth: '200px',
              }}
            >
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <div className="action-icon">{service.icon}</div>
              {service.subtitle && <small style={{ marginTop: '10px' }}>{service.subtitle}</small>}
            </div>
          ))}
        </div>

        <div className="ai-recommendations">
          <h2>AI Recommended Courses</h2>
          <div className="ai-courses-grid">
            {aiRecommendations.map(course => (
              <CourseCard key={course.id} {...course} isAIRecommended={true} />
            ))}
          </div>
        </div>

        <div className="all-courses">
          <h2>All Courses</h2>
          <div className="courses-grid">
            {courses.map(course => (
              <CourseCard
                key={course._id}
                {...course}
                courseId={course._id}  // Ensure courseId is passed here
                onCourseClick={() => handleCourseClick(course._id)} // Pass the course ID for AI Tutor
              />
            ))}
          </div>
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

        {/* Generate Pathway Modal */}
        <Modal open={isPathwayModalOpen} onClose={() => setIsPathwayModalOpen(false)}>
          <div className="modal-content">
            <h2>Generate Career Pathway</h2>
            <form onSubmit={handleGeneratePathway}>
              <TextField
                fullWidth
                label="Enter your desired career"
                value={careerChoice}
                onChange={(e) => setCareerChoice(e.target.value)}
                margin="normal"
              />
              <Button type="submit" variant="contained" color="primary">
                Generate Pathway
              </Button>
            </form>
            {generatedPathway && (
              <div className="generated-pathway">
                <h3>Recommended Pathway for {careerChoice}</h3>
                <ul>
                  {generatedPathway.map(course => (
                    <li key={course.id}>{course.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>

        {/* Add Course Modal */}
        <Modal open={isAddCourseModalOpen} onClose={() => setIsAddCourseModalOpen(false)}>
          <div className="modal-content">
            <h2>Add New Course</h2>
            <form onSubmit={handleAddCourse}>
              <TextField
                fullWidth
                label="Course Title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Instructor"
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                type="file"
                label="Upload Course PDF"
                inputProps={{ accept: '.pdf' }}
                onChange={(e) => setNewCourse({ ...newCourse, pdf: e.target.files[0] })}
              />
              <TextField
                fullWidth
                label="Duration"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Canva Presentation Link"  // New field for Canva link
                value={newCourse.canvaLink}
                onChange={handleCanvaLinkChange}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Level</InputLabel>
                <Select
                  value={newCourse.level}
                  onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                >
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Arts">Arts</MenuItem>
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                margin="normal"
              />
              <Button type="submit" variant="contained" color="primary">
                Add Course
              </Button>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default LMS;
