import React from 'react';
import { useParams } from 'react-router-dom';
import './Course.css';

// Add this function at the top of your file, outside of the component
function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const Courses = () => {
  const { slug } = useParams();

  // This would typically come from an API or database
  const coursesData = {
    "introduction-to-web-development": {
      title: "Introduction to Web Development",
      instructor: "John Doe",
      duration: "8 weeks",
      level: "Beginner",
      materials: [
        {
          title: "Course Overview",
          type: "ppt",
          url: "https://docs.google.com/presentation/d/18qUjGyX7OpBPZBuboPE45HMmx0PZ82xIfsCz-OqxFWw/edit?usp=sharing"
        },
        {
          title: "Course Design",
          type: "canva",
          url: "https://www.canva.com/design/DAGIfv3-5KA/gjYBhhxFJt7fzW8W_2PDlQ/edit?utm_content=DAGIfv3-5KA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton"
        }
      ]
    },
    // ... other courses ...
  };

  const courseData = Object.values(coursesData).find(course => generateSlug(course.title) === slug);

  if (!courseData) {
    return <div>Course not found</div>;
  }

  const renderMaterial = (material) => {
    switch (material.type) {
      case 'ppt':
        return (
          <iframe
            src={`https://docs.google.com/presentation/d/${material.url.split('/')[5]}/embed?start=false&loop=false&delayms=3000`}
            width="100%"
            height="600px"
            title={material.title}
            frameBorder="0"
            allowFullScreen={true}
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
          />
        );
      case 'canva':
        return (
          <iframe
            src={material.url.replace('/edit', '')}
            width="100%"
            height="600px"
            title={material.title}
            allowFullScreen={true}
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
          />
        );
      default:
        return <p>Unsupported material type</p>;
    }
  };

  return (
    <div className="course-container">
      <div className="course-header">
        <h1>{courseData.title}</h1>
        <p>Instructor: {courseData.instructor}</p>
        <p>Duration: {courseData.duration}</p>
        <p>Level: {courseData.level}</p>
      </div>
      <div className="course-content">
        <div className="material-list">
          <h2>Course Materials</h2>
          <ul>
            {courseData.materials.map((material, index) => (
              <li key={index}>{material.title}</li>
            ))}
          </ul>
        </div>
        <div className="material-display">
          {courseData.materials.map((material, index) => (
            <div key={index}>
              <h3>{material.title}</h3>
              {renderMaterial(material)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;