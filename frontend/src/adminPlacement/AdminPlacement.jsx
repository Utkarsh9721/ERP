import React, { useEffect, useState } from "react";
import axios from "axios";
import './Placement.css'


const AdminAddPlacement = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    department: "",
    batch: "",
    companyName: "",
    jobRole: "",
    packageLPA: "",
    placementType: "On-Campus",
    isPublic: true,
  });

  const [image, setImage] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [notification, setNotification] = useState(null);

  /* ================= NOTIFICATION ================= */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /* ================= FETCH PLACEMENTS ================= */
  const fetchPlacements = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/publicPlacement");
      setPlacements(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      showNotification("Failed to fetch placements", "error");
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  /* ================= FORM HANDLING ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      if (image) data.append("image", image);

      await axios.post("http://localhost:5000/api/admin/placements", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showNotification("Placement added successfully!");
      
      // Reset form
      setFormData({
        studentName: "",
        studentId: "",
        department: "",
        batch: "",
        companyName: "",
        jobRole: "",
        packageLPA: "",
        placementType: "On-Campus",
        isPublic: true,
      });
      setImage(null);
      fetchPlacements();
    } catch (err) {
      console.error(err);
      showNotification("Failed to add placement", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this placement?")) return;

    setDeleteLoading(id);
    try {
      await axios.delete(`http://localhost:5000/api/admin/placements/${id}`);
      showNotification("Placement deleted successfully!");
      fetchPlacements();
    } catch (err) {
      console.error("Delete failed", err);
      showNotification("Delete failed", "error");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="admin-placement-container">
      {/* Notification Toast */}
      {notification && (
        <div className={`toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <h2>Add Student Placement</h2>

      {/* ================= ADD FORM ================= */}
      <form onSubmit={handleSubmit} className="placement-form">
        <input 
          name="studentName" 
          placeholder="Student Name *" 
          value={formData.studentName} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          name="studentId" 
          placeholder="Student ID *" 
          value={formData.studentId} 
          onChange={handleChange} 
          required 
        />

        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setImage(e.target.files[0])}
          className="file-input"
        />

        <input 
          name="department" 
          placeholder="Department *" 
          value={formData.department} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          name="batch" 
          placeholder="Batch *" 
          value={formData.batch} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          name="companyName" 
          placeholder="Company Name *" 
          value={formData.companyName} 
          onChange={handleChange} 
          required 
        />
        
        <input 
          name="jobRole" 
          placeholder="Job Role *" 
          value={formData.jobRole} 
          onChange={handleChange} 
          required 
        />

        <input
          type="number"
          name="packageLPA"
          placeholder="Package (LPA) *"
          value={formData.packageLPA}
          onChange={handleChange}
          required
          min="0"
          step="0.1"
        />

        <select name="placementType" value={formData.placementType} onChange={handleChange}>
          <option value="On-Campus">On-Campus</option>
          <option value="Off-Campus">Off-Campus</option>
          <option value="Internship">Internship</option>
        </select>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="isPublic" 
            checked={formData.isPublic} 
            onChange={handleChange} 
          />
          <span>Public Placement</span>
        </label>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Saving..." : "➕ Add Placement"}
        </button>
      </form>

      {/* ================= PLACEMENTS LIST ================= */}
      <h2>All Placements ({placements.length})</h2>

      {placements.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>No placements added yet. Start by adding one above.</p>
        </div>
      ) : (
        placements.map((p) => (
          <div key={p._id} className="placement-card">
            {p.studentImage && (
              <img src={p.studentImage} alt={p.studentName} className="placement-image" />
            )}
            
            <div className="card-content">
              <h4>{p.studentName} – {p.companyName}</h4>
              <p><strong>Student ID:</strong> {p.studentId}</p>
              <p><strong>Department:</strong> {p.department} | <strong>Batch:</strong> {p.batch}</p>
              <p><strong>Role:</strong> {p.jobRole}</p>
              <p><strong>Package:</strong> {p.packageLPA} LPA</p>
              
              <div className="placement-type">
                {p.placementType} • {p.isPublic ? "Public" : "Private"}
              </div>

              <button
                onClick={() => handleDelete(p._id)}
                className="delete-btn"
                disabled={deleteLoading === p._id}
              >
                {deleteLoading === p._id ? "Deleting..." : "🗑 Delete"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminAddPlacement;