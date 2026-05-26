import React, { useEffect, useState } from "react";
import axios from "axios";
import "./placements.css";

const PublicPlacement = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/publicPlacement"
        );
        setPlacements(res.data);
      } catch (error) {
        console.error("Fetch placements error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacements();
  }, []);

  if (loading) return <p>Loading placements...</p>;

  return (
    <div className="placements-container">
      <h2>Student Placements</h2>

      <div className="placement-grid">
        {placements.length === 0 ? (
          <p>No placement records available</p>
        ) : (
          placements.map((p) => (
            <div key={p._id} className="placement-card">

              {/* ✅ STUDENT IMAGE */}
              {p.studentImage ? (
                <img
                  src={p.studentImage}
                  alt={p.studentName}
                  className="student-image"
                />
              ) : (
                <div className="no-image">No Image</div>
              )}

              <h3>{p.studentName}</h3>
              <p><b>Department:</b> {p.department}</p>
              <p><b>Batch:</b> {p.batch}</p>
              <p><b>Company:</b> {p.companyName}</p>
              <p><b>Role:</b> {p.jobRole}</p>
              <p><b>Package:</b> {p.packageLPA} LPA</p>

              <span className="badge">{p.placementType}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicPlacement;
