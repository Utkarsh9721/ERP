import React, { useEffect, useState } from "react";
import axios from "axios";
import "./public.css";

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      setError("Failed to fetch announcements. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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

  /* 🔹 Get initials from name */
  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-state">
          <div className="icon">⚠️</div>
          <p>{error}</p>
          <button onClick={fetchAnnouncements} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📢 Announcements</h1>
        <p className="dashboard-subtitle">
          Stay updated with the latest news and important information from your institution
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📢</div>
          <p>No announcements available at the moment. Check back later!</p>
        </div>
      ) : (
        announcements.map((a, index) => (
          <div 
            key={a.id} 
            className="announcement-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h2>{a.title}</h2>
            <p className="announcement-content">{a.description}</p>

            {a.image_url && (
              <div className="announcement-image-container">
                <img
                  src={a.image_url}
                  alt={a.title}
                  onClick={() => setZoomImage(a.image_url)}
                  className="announcement-image"
                />
                <div className="image-actions">
                  <a
                    href={a.image_url}
                    download={`${a.title.replace(/\s+/g, '-')}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="download-link"
                  >
                    ⬇️ Download Image
                  </a>
                  <span className="image-indicator">
                    📷 Click image to zoom
                  </span>
                </div>
              </div>
            )}

            <div className="announcement-meta">
              <div className="posted-by">
                <div className="avatar">{getInitials(a.created_by)}</div>
                <span>Posted by: {a.created_by || "Administrator"}</span>
              </div>
              <div className="timestamp">
                📅 {formatDate(a.created_at)}
              </div>
            </div>
          </div>
        ))
      )}

      {/* ZOOM MODAL */}
      {zoomImage && (
        <div className="zoom-modal-overlay" onClick={() => setZoomImage(null)}>
          <button 
            className="close-button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomImage(null);
            }}
          >
            ✕
          </button>
          <div className="zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed Announcement" />
          </div>
        </div>
      )}

      {/* Optional Pagination */}
      {announcements.length > 0 && (
        <div className="pagination">
          <button className="pagination-button active">1</button>
          <button className="pagination-button">2</button>
          <button className="pagination-button">3</button>
          <button className="pagination-button">→</button>
        </div>
      )}
    </div>
  );
}