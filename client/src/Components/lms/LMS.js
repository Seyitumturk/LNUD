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

const CourseCard = ({ title, instructor, duration, level, description, featured, progress, bgImage, courseId, onCourseClick, isAIRecommended }) => {
  const slug = generateSlug(title);
  return (
    <Link to={`/course/${slug}`} state={{ courseId: courseId }} className={`course-card ${featured ? 'featured' : ''} ${isAIRecommended ? 'ai-recommended' : ''}`}>
      <div onClick={onCourseClick} className={`course-card`}>
        <div className="course-card-image" style={{ backgroundImage: `url(${bgImage})` }}></div>
        <div className="course-card-content">
          {featured && <div className="featured-badge">Featured</div>}
          <h3 className="course-title">{title}</h3>
          <div className="course-details">
            <span className="course-instructor">{instructor}</span>
            <span className="course-duration">{duration}</span>
            <span className="course-level">{level}</span>
          </div>
          <p className="course-description">{description}</p>
          {progress !== undefined && (
            <div className="course-progress">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              <span className="progress-text">{progress}% Complete</span>
            </div>
          )}
          <button className="enroll-button">{progress !== undefined ? 'Continue' : 'Enroll Now'}</button>
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
                onChange={(e) => setNewCourse({ ...newCourse, canvaLink: e.target.value })}
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
