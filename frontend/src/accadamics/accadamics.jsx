// src/pages/Academics.jsx
import React, { useState, useEffect } from "react";
import "./academics.css";

/* ------------------ DATA ------------------ */
const programData = [
  {
    id: 1,
    name: "Computer Science",
    degree: "Bachelor of Science",
    duration: "4 Years",
    credits: 120,
    department: "School of Engineering",
    description:
      "Learn software development, algorithms, data structures, and computer systems. Prepare for careers in software engineering, data science, and AI.",
    tuition: "$45,000/year",
    requirements: [
      "Calculus I & II",
      "Physics",
      "Intro to Programming",
      "Discrete Mathematics",
      "Data Structures",
    ],
    careerPaths: [
      "Software Engineer",
      "Data Scientist",
      "Systems Analyst",
      "Machine Learning Engineer",
      "Cybersecurity Analyst",
    ],
    accreditation: "Dr. APJ Abdul Kalam Technical University",
    applicationDeadline: "Soon",
    startDates: ["Fall", "Spring"],
    popular: true,
    tags: ["STEM", "Technology", "High-Demand", "Coding"],
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    faculty: "Dr.Raj Sharma",
    email: "cs.department@university.edu",
    phone: "9372423542",
    website: "/computer-science",
  
  },
  {
    id: 2,
    name: "Business Administration",
    degree: "Bachelor of Business Administration",
    duration: "4 Years",
    credits: 120,
    department: "Business School",
    description:
      "Develop leadership, management, and strategic decision-making skills. Specializations available in Marketing, Finance, and Management.",
    tuition: "$42,000/year",
    requirements: [
      "Algebra",
      "Economics",
      "Statistics",
      "Accounting Principles",
      "Business Ethics"
    ],
    careerPaths: [
      "Business Analyst",
      "Marketing Manager",
      "Financial Advisor",
      "Operations Manager",
      "Entrepreneur"
    ],
    accreditation: "Dr. APJ Abdul Kalam Technical University",
    applicationDeadline: "Soon",
    startDates: ["Fall"],
    popular: true,
    tags: ["Business", "Leadership", "Management", "Entrepreneurship"],
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    faculty: "Dr. Suraj patel",
    email: "business@university.edu",
    phone: "9259379374",
    website: "/business"
  },
  {
    id: 3,
    name: "Mechanical Engineering",
    degree: "Bachelor of Science",
    duration: "5 Years",
    credits: 150,
    department: "School of Engineering",
    description:
      "Learn design, analysis, and manufacturing of mechanical systems. Hands-on experience with CAD, robotics, and thermal systems.",
    tuition: "$46,000/year",
    requirements: [
      "Calculus I-III",
      "Physics",
      "Chemistry",
      "Dynamics",
      "Thermodynamics"
    ],
    careerPaths: [
      "Mechanical Engineer",
      "Automotive Engineer",
      "Aerospace Engineer",
      "Robotics Engineer",
      "Design Engineer"
    ],
    accreditation: "Dr. APJ Abdul Kalam Technical University",
    applicationDeadline: "Soon",
    startDates: ["Fall"],
    tags: ["STEM", "Engineering", "Design", "Robotics"],
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
    faculty: "Dr. Rohit patel",
    email: "mechanical@university.edu",
    phone: "02748265827",
    website: "/mechanical-engineering"
  }
];

const departments = ["All Departments", "School of Engineering", "Business School"];
const degrees = ["All Degrees", "Bachelor of Science", "Bachelor of Business Administration"];
const durations = ["All Durations", "4 Years", "5 Years"];

/* ------------------ COMPONENT ------------------ */
const Academics = () => {
  const [filteredPrograms, setFilteredPrograms] = useState(programData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedDegree, setSelectedDegree] = useState("All Degrees");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  /* ------------------ FILTER LOGIC ------------------ */
  useEffect(() => {
    setLoading(true);

    let filtered = [...programData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Department filter
    if (selectedDepartment !== "All Departments") {
      filtered = filtered.filter((p) => p.department === selectedDepartment);
    }

    // Degree filter
    if (selectedDegree !== "All Degrees") {
      filtered = filtered.filter((p) => p.degree === selectedDegree);
    }

    // Duration filter
    if (selectedDuration !== "All Durations") {
      filtered = filtered.filter((p) => p.duration === selectedDuration);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "tuition") {
        return (
          parseInt(a.tuition.replace(/\D/g, "")) -
          parseInt(b.tuition.replace(/\D/g, ""))
        );
      }
      return 0;
    });

    setTimeout(() => {
      setFilteredPrograms(filtered);
      setLoading(false);
    }, 300);
  }, [searchTerm, selectedDepartment, selectedDegree, selectedDuration, sortBy]);

  const toggleProgramDetails = (programId) => {
    setExpandedProgram(expandedProgram === programId ? null : programId);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("All Departments");
    setSelectedDegree("All Degrees");
    setSelectedDuration("All Durations");
    setSortBy("name");
  };

  const handleProgramClick = (programId) => {
    console.log(`Viewing program ${programId}`);
  };

  /* ------------------ JSX ------------------ */
  return (
    <div className="academics-container">
      {/* Hero Section */}
      <div className="academics-hero">
        <h1>Academic Programs</h1>
        <p>
          Explore our comprehensive range of undergraduate and graduate programs 
          designed to prepare you for success in today's dynamic world.
        </p>
      </div>

      {/* Search and Filters Section */}
      <div className="search-section">
        <div className="search-bar">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search programs by name, keyword, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Department</label>
            <select 
              className="filter-select"
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Degree Type</label>
            <select 
              className="filter-select"
              value={selectedDegree} 
              onChange={(e) => setSelectedDegree(e.target.value)}
            >
              {degrees.map((degree) => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Duration</label>
            <select 
              className="filter-select"
              value={selectedDuration} 
              onChange={(e) => setSelectedDuration(e.target.value)}
            >
              {durations.map((duration) => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select 
              className="filter-select"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name A-Z</option>
              <option value="tuition">Tuition (Low to High)</option>
            </select>
          </div>
        </div>

        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <i className="fas fa-th"></i> Grid View
          </button>
          <button 
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <i className="fas fa-list"></i> List View
          </button>
          <button className="reset-btn" onClick={resetFilters}>
            <i className="fas fa-redo"></i> Reset Filters
          </button>
        </div>

        <div className="results-info">
          <div className="results-count">
            Showing <strong>{filteredPrograms.length}</strong> of{" "}
            <strong>{programData.length}</strong> programs
          </div>
          <div className="active-filters">
            {selectedDepartment !== "All Departments" && (
              <span className="active-filter">
                {selectedDepartment}
                <button onClick={() => setSelectedDepartment("All Departments")}>×</button>
              </span>
            )}
            {selectedDegree !== "All Degrees" && (
              <span className="active-filter">
                {selectedDegree}
                <button onClick={() => setSelectedDegree("All Degrees")}>×</button>
              </span>
            )}
            {selectedDuration !== "All Durations" && (
              <span className="active-filter">
                {selectedDuration}
                <button onClick={() => setSelectedDuration("All Durations")}>×</button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading programs...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-search"></i>
          <h3>No programs found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="primary-btn" onClick={resetFilters}>
            <i className="fas fa-redo"></i> Clear All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="programs-grid">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className={`program-card ${program.popular ? "popular" : ""}`}
              onClick={() => handleProgramClick(program.id)}
            >
              {program.popular && (
                <div className="popular-tag">
                  <i className="fas fa-star"></i> Popular
                </div>
              )}

              <div className="program-image">
                <img src={program.image} alt={program.name} />
                <div className="image-overlay">
                  <span className="department-tag">
                    {program.department.split(" ").pop()}
                  </span>
                </div>
              </div>

              <div className="program-content">
                <div className="program-header">
                  <h3>{program.name}</h3>
                  <p className="degree-type">{program.degree}</p>
                </div>

                <div className="program-meta">
                  <span className="meta-item">
                    <i className="fas fa-clock"></i> {program.duration}
                  </span>
                  <span className="meta-item">
                    <i className="fas fa-graduation-cap"></i> {program.credits} credits
                  </span>
                  <span className="meta-item">
                    <i className="fas fa-dollar-sign"></i> {program.tuition}
                  </span>
                </div>

                <p className="program-description">{program.description}</p>

                <div className="program-tags">
                  {program.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="program-details">
                  <div className="detail-row">
                    <i className="fas fa-calendar"></i>
                    <span>
                      <strong>Deadline:</strong> {program.applicationDeadline}
                    </span>
                  </div>
                  <div className="detail-row">
                    <i className="fas fa-calendar-alt"></i>
                    <span>
                      <strong>Starts:</strong> {program.startDates.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="program-actions">
                  <button
                    className="details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProgramDetails(program.id);
                    }}
                  >
                    {expandedProgram === program.id ? "Show Less" : "View Details"}
                    <i
                      className={`fas fa-chevron-${
                        expandedProgram === program.id ? "up" : "down"
                      }`}
                    ></i>
                  </button>
                  <button
                    className="apply-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle apply logic
                    }}
                  >
                    <i className="fas fa-arrow-right"></i> Apply Now
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedProgram === program.id && (
                  <div className="expanded-details">
                    <div className="details-grid">
                      <div className="detail-column">
                        <h4>
                          <i className="fas fa-clipboard-list"></i> Admission Requirements
                        </h4>
                        <ul>
                          {program.requirements.map((req, index) => (
                            <li key={index}>
                              <i className="fas fa-check"></i> {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="detail-column">
                        <h4>
                          <i className="fas fa-briefcase"></i> Career Paths
                        </h4>
                        <ul>
                          {program.careerPaths.map((path, index) => (
                            <li key={index}>
                              <i className="fas fa-arrow-right"></i> {path}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="detail-column">
                        <h4>
                          <i className="fas fa-info-circle"></i> Program Details
                        </h4>
                        <p>
                          <strong>Accreditation:</strong> {program.accreditation}
                        </p>
                        <p>
                          <strong>Department Chair:</strong> {program.faculty}
                        </p>
                        <p>
                          <strong>Email:</strong> {program.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {program.phone}
                        </p>
                      </div>
                    </div>
                    <div className="additional-actions">
                      <button className="secondary-btn">
                        <i className="fas fa-book"></i> View Curriculum
                      </button>
                      <button className="secondary-btn">
                        <i className="fas fa-calendar"></i> Schedule Visit
                      </button>
                      <button className="secondary-btn">
                        <i className="fas fa-download"></i> Download Brochure
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="programs-list">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className={`program-list-item ${program.popular ? "popular" : ""}`}
              onClick={() => handleProgramClick(program.id)}
            >
              <div className="list-image">
                <img src={program.image} alt={program.name} />
              </div>

              <div className="list-content">
                <div className="list-header">
                  <div>
                    <h3>{program.name}</h3>
                    <p className="list-degree">
                      {program.degree} • {program.department}
                    </p>
                  </div>
                  {program.popular && (
                    <span className="popular-tag">
                      <i className="fas fa-star"></i> Popular
                    </span>
                  )}
                </div>

                <p className="list-description">{program.description}</p>

                <div className="list-meta">
                  <span>
                    <i className="fas fa-clock"></i> {program.duration}
                  </span>
                  <span>
                    <i className="fas fa-graduation-cap"></i> {program.credits} credits
                  </span>
                  <span>
                    <i className="fas fa-dollar-sign"></i> {program.tuition}
                  </span>
                  <span>
                    <i className="fas fa-calendar"></i> Deadline:{" "}
                    {program.applicationDeadline}
                  </span>
                </div>

                <div className="list-actions">
                  <button
                    className="details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProgramDetails(program.id);
                    }}
                  >
                    {expandedProgram === program.id ? "Show Less" : "View Details"}
                  </button>
                  <button className="apply-btn">Apply Now</button>
                  <button className="secondary-btn">Save Program</button>
                </div>

                {expandedProgram === program.id && (
                  <div className="list-expanded">
                    <div className="list-details">
                      <div>
                        <h4>Career Paths</h4>
                        <ul>
                          {program.careerPaths.slice(0, 3).map((path, index) => (
                            <li key={index}>{path}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4>Contact</h4>
                        <p>{program.faculty}</p>
                        <p>{program.email}</p>
                        <p>{program.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Academics;