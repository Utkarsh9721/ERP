import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">🎓 College ERP</div>

        {/* Hamburger */}
        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </div>

        <ul className={`menu ${menuOpen ? "open" : ""}`}>

          <li><Link to="/">Home</Link></li>

          {/* Campus */}
          <li className="dropdown">
            <span
              className="dropbtn"
              onClick={() => setCampusOpen(!campusOpen)}
            >
              Campus ▾
            </span>
            <ul className={`dropdown-menu ${campusOpen ? "show" : ""}`}>
              <li><Link to="/campus/library">Library</Link></li>
              <li><Link to="/campus/classes">Classes</Link></li>
              <li><Link to="/campus/garden">Garden</Link></li>
            </ul>
          </li>

          {/* About */}
          <li className="dropdown">
            <span
              className="dropbtn"
              onClick={() => setAboutOpen(!aboutOpen)}
            >
              About ▾
            </span>
            <ul className={`dropdown-menu ${aboutOpen ? "show" : ""}`}>
              <li><Link to="/about/history">History</Link></li>
              <li><Link to="/public/events">Events</Link></li>
              <li><Link to="/about/annual-report">Annual Report</Link></li>
              <li><Link to="/about/leadership">Leadership</Link></li>
              <li><Link to="/about/ranking">Ranking</Link></li>
            </ul>
          </li>

          <li><Link to="/publicPlacement">Placements</Link></li>
          <li><Link to="/publicAnnouncement">Announcements</Link></li>
          <li><Link to="/Academics">Academics</Link></li>
          <li><Link to="/Admissions">Admissions</Link></li>
          <li><Link to="faculty">Faculty</Link></li>
          <li><Link to="/Research">Research</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/login/option">ERP</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
