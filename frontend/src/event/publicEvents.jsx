import React, { useEffect, useState } from "react";
import axios from "axios";
import './publicEvents.css'

const PublicEvents = () => {
  const [events, setEvents] = useState([]);       // always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(""); // filter by department

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/public/events");
        setEvents(res.data?.events || []); // fallback to empty array
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
        setEvents([]); // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events if a department is selected
  const filteredEvents = departmentFilter
    ? events.filter(e => e.department === departmentFilter)
    : events;

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="events-container">
      <h2>Upcoming Events</h2>

      {/* Department filter dropdown */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="departmentFilter">Filter by department: </label>
        <select
          id="departmentFilter"
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
        >
          <option value="">All</option>
          {Array.from(new Set(events.map(e => e.department))).map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <p>No events found</p>
      ) : (
        <div className="events-grid">
          {filteredEvents.map(event => (
            <div key={event.id || event._id} className="event-card">
              {event.imageUrl && <img src={event.imageUrl} alt={event.title} />}
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <small>{new Date(event.date).toLocaleDateString()}</small>
              <p><b>Department:</b> {event.department}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicEvents;
