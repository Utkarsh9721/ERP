import React, { useEffect, useState } from "react";
import axios from "axios";
import "./announcement.css";

const Announcements = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

 // Announcements.js
const created_by = "ea803d94-17a8-44d7-a85e-fda757bc2bbe";

  /* 🔹 Show notification */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* 🔹 Fetch announcements */
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Fetch error", err);
      showNotification("Failed to load announcements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  /* 🔹 Add announcement */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("created_by", created_by);
      if (image) formData.append("image", image);

      await axios.post("http://localhost:5000/api/announcements", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showNotification("Announcement added successfully!");
      setTitle("");
      setDescription("");
      setImage(null);
      fetchAnnouncements();
    } catch (err) {
      console.error("Add error", err);
      showNotification("Failed to add announcement", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* 🔹 Delete announcement */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/announcements/${id}`);
      showNotification("Announcement deleted successfully!");
      fetchAnnouncements();
    } catch (err) {
      console.error("Delete error", err);
      showNotification("Failed to delete announcement", "error");
    }
  };

  /* 🔹 Format date */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="announcements-container">
      {/* Notification Toast */}
      {notification && (
        <div className={`toast ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.message}
        </div>
      )}

      <h2>📢 Announcements Management</h2>

      {/* ADD FORM */}
      <form onSubmit={handleSubmit} className="announcement-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            placeholder="Enter announcement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Enter announcement details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="file-upload">
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <label htmlFor="image-upload">
            📁 {image ? "Change Image" : "Upload Image (Optional)"}
          </label>
          
          {image && (
            <div className="file-preview">
              <img src={URL.createObjectURL(image)} alt="Preview" />
              <span className="file-name">{image.name}</span>
              <button 
                type="button" 
                onClick={() => setImage(null)}
                className="delete-btn"
                style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? (
            <>
              <span className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }} />
              Adding...
            </>
          ) : (
            <>
              ➕ Add Announcement
            </>
          )}
        </button>
      </form>

      {/* ANNOUNCEMENTS LIST */}
      <div className="announcements-list">
        <h3>
          All Announcements 
          <span className="announcements-count">{announcements.length}</span>
        </h3>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📢</div>
            <p>No announcements yet. Add your first announcement above!</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="announcement-card">
              <h4>{a.title}</h4>
              <p className="description">{a.description}</p>

              {a.image_url && (
                <div className="image-container">
                  <img
                    src={a.image_url}
                    alt={a.title}
                    className="announcement-image"
                  />
                </div>
              )}

              <div className="meta">
                <span className="date">
                  📅 {a.created_at ? formatDate(a.created_at) : "Recently"}
                </span>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="delete-btn"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;