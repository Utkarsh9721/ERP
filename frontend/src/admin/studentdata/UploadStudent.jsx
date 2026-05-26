import React, { useState } from "react";
import axios from "axios";
import "./upload.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // This is CRITICAL for sending cookies
  headers: {
    "Content-Type": "application/json"
  }
});

const UploadStudents = () => {
  const [form, setForm] = useState({
    studentId: "",
    rollNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    branch: "",
    section: "",
    semester: 1,
    admissionYear: new Date().getFullYear(),
    passingYear: new Date().getFullYear() + 4,
    dateOfBirth: "",
    gender: "Male",
    fatherName: "",
    motherName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bloodGroup: "",
    category: "",
    achievements: "",
    certificates: ""
  });

  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(null);

  const branches = ["CSE", "IT", "ECE", "EEE", "ME", "CE", "BBA", "BCA", "MCA"];
  const sections = ["A", "B", "C", "D"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const categories = ["General", "OBC", "SC", "ST", "EWS", "Other"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowPassword(null);

    try {
      const data = new FormData();
      
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          data.append(key, value);
        }
      });
      
      if (profilePic) {
        data.append("profilePic", profilePic);
      }

      // Use the api instance instead of direct axios
      const res = await api.post("/api/admin/students/add", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSuccess(`Student added successfully!`);
        setShowPassword(res.data.tempPassword);
        
        // Reset form
        setForm({
          studentId: "",
          rollNumber: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          branch: "",
          section: "",
          semester: 1,
          admissionYear: new Date().getFullYear(),
          passingYear: new Date().getFullYear() + 4,
          dateOfBirth: "",
          gender: "Male",
          fatherName: "",
          motherName: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          bloodGroup: "",
          category: "",
          achievements: "",
          certificates: ""
        });
        setProfilePic(null);
        setProfilePreview(null);
        
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || "Failed to add student";
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Password copied to clipboard!");
  };

  return (
    <div className="upload-student-container">
      <div className="upload-student-header">
        <h1>📚 Add New Student</h1>
        <p>Fill in the details below to register a new student in the system</p>
      </div>

      {success && (
        <div className="alert success">
          <span>✅ {success}</span>
          {showPassword && (
            <div className="password-box">
              <strong>Temporary Password:</strong> 
              <code>{showPassword}</code>
              <button onClick={() => copyToClipboard(showPassword)}>📋 Copy</button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="alert error">
          <span>❌ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-grid">
          {/* Personal Information Section */}
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Student ID *</label>
                <input
                  name="studentId"
                  placeholder="e.g., STU2024001"
                  value={form.studentId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Roll Number *</label>
                <input
                  name="rollNumber"
                  placeholder="e.g., 2024CS001"
                  value={form.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  placeholder="Mobile Number"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="form-section">
            <h3>Academic Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Branch *</label>
                <select name="branch" value={form.branch} onChange={handleChange} required>
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Section *</label>
                <select name="section" value={form.section} onChange={handleChange} required>
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Semester *</label>
                <input
                  type="number"
                  name="semester"
                  min="1"
                  max="8"
                  value={form.semester}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Admission Year *</label>
                <input
                  type="number"
                  name="admissionYear"
                  min="2000"
                  max="2030"
                  value={form.admissionYear}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Passing Year</label>
                <input
                  type="number"
                  name="passingYear"
                  min="2000"
                  max="2040"
                  value={form.passingYear}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Family Information Section */}
          <div className="form-section">
            <h3>Family Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Father's Name</label>
                <input
                  name="fatherName"
                  placeholder="Father's Name"
                  value={form.fatherName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Mother's Name</label>
                <input
                  name="motherName"
                  placeholder="Mother's Name"
                  value={form.motherName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="form-section">
            <h3>Address Information</h3>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                placeholder="Full Address"
                value={form.address}
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  name="pincode"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="form-section">
            <h3>Additional Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Achievements</label>
              <textarea
                name="achievements"
                placeholder="Any achievements or awards"
                value={form.achievements}
                onChange={handleChange}
                rows="2"
              />
            </div>

            <div className="form-group full-width">
              <label>Certificates (comma separated)</label>
              <input
                name="certificates"
                placeholder="e.g., Python Certification, Web Dev Course"
                value={form.certificates}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="form-section">
            <h3>Profile Picture</h3>
            <div className="profile-upload">
              {profilePreview && (
                <div className="profile-preview">
                  <img src={profilePreview} alt="Profile preview" />
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={() => {
                      setProfilePic(null);
                      setProfilePreview(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="profilePic"
                  style={{ display: 'none' }}
                />
                <label htmlFor="profilePic" className="file-input-label">
                  📸 {profilePic ? "Change Photo" : "Upload Photo"}
                </label>
                <small>Max size: 5MB. Supported: JPG, PNG, GIF</small>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Adding Student..." : "➕ Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadStudents;