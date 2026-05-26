import { useState, useEffect } from "react";
import axios from "axios";
import './event.css';

export default function AdminEvents() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);
  const [department, setDepartment] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      showToast("Failed to load events", "error");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setFileName(file.name);
    }
  };

  // Upload event
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      showToast("Please select an image", "error");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("department", department);
      formData.append("image", image);

      await axios.post("http://localhost:5000/api/admin/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setDepartment("");
      setImage(null);
      setFileName("");
      
      showToast("Event created successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error uploading event:", error);
      showToast("Failed to create event", "error");
    } finally {
      setUploading(false);
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/events/${id}`, {
        withCredentials: true,
      });
      showToast("Event deleted successfully!");
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event", "error");
    }
  };

  return (
    <div className="admin-events-container">
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <div className="admin-header">
        <h1>College Events Management</h1>
        <p className="admin-subtitle">Create and manage college events</p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="upload-form">
        <h2 className="form-title">Create New Event</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input
              type="text"
              placeholder="Enter event title"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department / Organization</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">Computer Science & Engineering</option>
              <option value="ECE">Electronics & Communication</option>
              <option value="ME">Mechanical Engineering</option>
              <option value="CE">Civil Engineering</option>
              <option value="MBA">Business Administration</option>
              <option value="CULTURAL">Cultural Club</option>
              <option value="SPORTS">Sports Committee</option>
              <option value="TECH">Technical Club</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Event Description</label>
            <textarea
              placeholder="Describe the event details..."
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Image</label>
            <div className="file-upload-wrapper">
              <button type="button" className="file-upload-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Choose Image
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
            </div>
            {fileName && <span className="file-name">Selected: {fileName}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={`submit-button ${uploading ? 'loading' : ''}`}
        >
          {uploading ? (
            <>
              Uploading...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Create Event
            </>
          )}
        </button>
      </form>

      {/* Events List */}
      <div className="events-section">
        <div className="section-header">
          <h2>All Events ({events.length})</h2>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3>No Events Yet</h3>
            <p>Create your first event to get started</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="event-image"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/400x220/667eea/ffffff?text=${encodeURIComponent(event.title)}`;
                  }}
                />
                <div className="event-content">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-meta">
                    <span className="department-badge">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      {event.department}
                    </span>
                    <span className="date-display">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteEvent(event._id)}
                    className="delete-button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                    Delete Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}