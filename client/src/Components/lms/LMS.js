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

const CourseCard = ({ title, instructor, duration, level, description, featured, progress, bgImage, isAIRecommended }) => {
  const slug = generateSlug(title);
  return (
    <Link to={`/course/${slug}`} className={`course-card ${featured ? 'featured' : ''} ${isAIRecommended ? 'ai-recommended' : ''}`}>
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
    </Link>
  );
};

const LMS = () => {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [isPathwayModalOpen, setIsPathwayModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [careerChoice, setCareerChoice] = useState('');
  const [generatedPathway, setGeneratedPathway] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    instructor: '',
    duration: '',
    level: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    // Fetch AI recommendations when the component mounts
    fetchAiRecommendations();
  }, []);

  const toggleChatbot = () => setIsChatOpen(!isChatOpen);

  const fetchAiRecommendations = async () => {
    // This is a placeholder function. In a real implementation,
    // you would call your backend API that interfaces with GPT-4.
    try {
      const response = await fetch('/api/ai-recommendations');
      const data = await response.json();
      setAiRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    }
  };

  const handleGeneratePathway = async (e) => {
    e.preventDefault();
    // This is a placeholder function. In a real implementation,
    // you would call your AI backend to generate the pathway.
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

  const handleAddCourse = (e) => {
    e.preventDefault();
    // Here you would typically send the new course data to your backend
    console.log('New course:', newCourse);
    setIsAddCourseModalOpen(false);
    // Reset the form
    setNewCourse({
      title: '',
      instructor: '',
      duration: '',
      level: '',
      category: '',
      description: '',
    });
  };

  const courses = [
    { id: 1, title: "Introduction to Mi'kmaq Language", instructor: "Dr. Emily Johnson", duration: "8 weeks", level: "Beginner", description: "Learn the basics of Mi'kmaq language and culture.", featured: true, bgImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 2, title: "Advanced Sustainable Fishing Practices", instructor: "Prof. Michael Smith", duration: "12 weeks", level: "Advanced", description: "Explore cutting-edge sustainable fishing techniques.", progress: 75, bgImage: "https://images.unsplash.com/photo-1545816250-e12bedba42ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 3, title: "Traditional Medicinal Plants", instructor: "Elder Sarah Denny", duration: "6 weeks", level: "Intermediate", description: "Discover the healing properties of indigenous plants.", bgImage: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 4, title: "Cultural Preservation Techniques", instructor: "Dr. Robert White", duration: "10 weeks", level: "All Levels", description: "Learn methods to preserve and promote indigenous culture.", bgImage: "https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 5, title: "Indigenous Art and Storytelling", instructor: "Maria Running Wolf", duration: "8 weeks", level: "Beginner", description: "Explore traditional art forms and storytelling techniques.", bgImage: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 6, title: "Environmental Stewardship", instructor: "Dr. John River", duration: "10 weeks", level: "Intermediate", description: "Learn about environmental conservation from an indigenous perspective.", progress: 30, bgImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 7, title: "Introduction to Indigenous Astronomy", instructor: "Dr. Stargazer", duration: "8 weeks", level: "Beginner", category: "Science", description: "Explore the night sky through indigenous perspectives.", featured: true, bgImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 8, title: "Traditional Mathematics in Nature", instructor: "Prof. Fibonacci", duration: "10 weeks", level: "Intermediate", category: "Mathematics", description: "Discover mathematical patterns in natural indigenous designs.", bgImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterLevel === 'All' || course.level === filterLevel) &&
    (filterCategory === 'All' || course.category === filterCategory)
  );

  const aiRecommendedCourses = [
    { id: 'ai1', title: "AI Ethics and Governance", instructor: "Dr. Emma Watson", duration: "6 weeks", level: "Intermediate", description: "Explore the ethical implications of AI and develop governance frameworks.", bgImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 'ai2', title: "Machine Learning for Climate Change", instructor: "Prof. Alan Turing", duration: "8 weeks", level: "Advanced", description: "Apply machine learning techniques to address climate change challenges.", bgImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
    { id: 'ai3', title: "Quantum Computing Fundamentals", instructor: "Dr. Quantum Leap", duration: "10 weeks", level: "Beginner", description: "Dive into the world of quantum computing and its potential applications.", bgImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" },
  ];

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
    { title: "Find Bursary", description: "Discover financial aid opportunities", color: "var(--purple)", icon: <SearchIcon fontSize="large" />, onClick: () => {/* Add bursary search functionality */}, subtitle: "by Elev" },
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
            {aiRecommendedCourses.map(course => (
              <CourseCard key={course.id} {...course} isAIRecommended={true} />
            ))}
          </div>
        </div>

        <div className="all-courses">
          <h2>All Courses</h2>
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>

        {/* Chat button */}
        <button
          className="solid-chat-button glass-chat-button"
          onClick={toggleChatbot}
        >
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
                label="Duration"
                value={newCourse.duration}
                onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
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