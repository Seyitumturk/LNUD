import React from 'react';
import './lms.css';

const Course = ({ title, instructor, duration, level }) => {
  return (
    <div className="course-card">
      <div className="course-content">
        <h2>{title}</h2>
        <p className="instructor">Instructor: {instructor}</p>
        <p className="duration">Duration: {duration}</p>
        <p className="level">Level: {level}</p>
      </div>
      <button className="enroll-button">Enroll Now</button>
    </div>
  );
};

export default Course;