import React from 'react';
import './lms.css';
import Course from './Course';

const LMS = () => {
  const courses = [
    { id: 1, title: "Introduction to Mi'kmaq Language", instructor: "Dr. Emily Johnson", duration: "8 weeks", level: "Beginner" },
    { id: 2, title: "Advanced Sustainable Fishing Practices", instructor: "Prof. Michael Smith", duration: "12 weeks", level: "Advanced" },
    { id: 3, title: "Traditional Medicinal Plants", instructor: "Elder Sarah Denny", duration: "6 weeks", level: "Intermediate" },
    { id: 4, title: "Cultural Preservation Techniques", instructor: "Dr. Robert White", duration: "10 weeks", level: "All Levels" },
  ];

  return (
    <div className="lms-container">
      <h1>Learning Management System</h1>
      <div className="courses-grid">
        {courses.map(course => (
          <Course key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
};

export default LMS;