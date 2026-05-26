import React, { useState } from "react";
import axios from "axios";

const Admission = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    course: "",
    department: "",
    address: "",
    marks: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/admission", formData);
      alert("Admission submitted successfully!");

      setFormData({
        name: "",
        email: "",
        mobile: "",
        dob: "",
        gender: "",
        course: "",
        department: "",
        address: "",
        marks: "",
      });
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
    },
    container: {
      width: "100%",
      maxWidth: "800px",
      background: "white",
      borderRadius: "20px",
      boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      padding: "40px",
      margin: "20px",
    },
    header: {
      textAlign: "center",
      color: "#2c3e50",
      fontSize: "2.5rem",
      marginBottom: "10px",
      fontWeight: "600",
      background: "linear-gradient(90deg, #3498db, #2c3e50)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      position: "relative",
    },
    headerLine: {
      content: '""',
      display: "block",
      width: "100px",
      height: "4px",
      background: "linear-gradient(90deg, #3498db, #2c3e50)",
      margin: "15px auto 30px",
      borderRadius: "2px",
    },
    form: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "25px",
    },
    input: {
      width: "100%",
      padding: "15px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "16px",
      transition: "all 0.3s ease",
      background: "#f9f9f9",
      fontFamily: "'Segoe UI', sans-serif",
    },
    textarea: {
      width: "100%",
      padding: "15px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "16px",
      transition: "all 0.3s ease",
      background: "#f9f9f9",
      fontFamily: "'Segoe UI', sans-serif",
      minHeight: "120px",
      resize: "vertical",
      lineHeight: "1.5",
      gridColumn: "1 / -1",
    },
    select: {
      width: "100%",
      padding: "15px",
      border: "2px solid #e0e0e0",
      borderRadius: "10px",
      fontSize: "16px",
      transition: "all 0.3s ease",
      background: "#f9f9f9",
      fontFamily: "'Segoe UI', sans-serif",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 15px center",
      backgroundSize: "20px",
      cursor: "pointer",
    },
    button: {
      background: "linear-gradient(90deg, #3498db, #2980b9)",
      color: "white",
      border: "none",
      padding: "18px",
      borderRadius: "12px",
      fontSize: "18px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      marginTop: "10px",
      gridColumn: "1 / -1",
    },
    buttonHover: {
      background: "linear-gradient(90deg, #2980b9, #1c6ea4)",
      transform: "translateY(-3px)",
      boxShadow: "0 7px 20px rgba(52, 152, 219, 0.4)",
    },
    buttonDisabled: {
      background: "linear-gradient(90deg, #bdc3c7, #95a5a6)",
      cursor: "not-allowed",
      animation: "pulse 1.5s infinite",
    },
    focus: {
      outline: "none",
      borderColor: "#3498db",
      boxShadow: "0 0 0 3px rgba(52, 152, 219, 0.2)",
      background: "white",
      transform: "translateY(-2px)",
    },
  };

  // Inline animation styles
  const animationStyle = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `;

  return (
    <>
      <style>{animationStyle}</style>
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.header}>
            College Admission Form
            <div style={styles.headerLine} />
          </h1>

          <form 
            onSubmit={handleSubmit} 
            style={styles.form}
            onMouseEnter={(e) => {
              e.currentTarget.querySelectorAll('input, select, textarea').forEach(el => {
                el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
              });
            }}
          >
            <input
              type="text"
              name="name"
              placeholder="Enter Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            />

            <input
              type="tel"
              name="mobile"
              placeholder="Enter Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            />

            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            />

            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              required
              style={styles.select}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <select 
              name="course" 
              value={formData.course} 
              onChange={handleChange} 
              required
              style={styles.select}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            >
              <option value="">Select Course</option>
              <option>B.Tech</option>
              <option>B.Sc</option>
              <option>BCA</option>
              <option>M.Tech</option>
              <option>MCA</option>
            </select>

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            />

            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
              style={styles.textarea}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            />

            <input
              type="number"
              name="marks"
              placeholder="10+2 Marks (%)"
              value={formData.marks}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.focus)}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0e0e0";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "#f9f9f9";
              }}
              onMouseEnter={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#3498db";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.target.matches(':focus')) {
                  e.target.style.borderColor = "#e0e0e0";
                }
              }}
            />

            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  Object.assign(e.target.style, styles.buttonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}
            >
              {loading ? "Submitting..." : "Submit Admission"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Admission;