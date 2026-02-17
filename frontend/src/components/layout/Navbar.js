import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/dashboardAdmin", label: "Dashboard", icon: "📊" },
    { path: "/admin/livres", label: "Livres", icon: "📚" },
    { path: "/admin/categories", label: "Catégories", icon: "🏷️" },
    { path: "/admin/clients", label: "Clients", icon: "👥" },
    { path: "/admin/orders", label: "Orders", icon: "📦" },
    { path: "/admin/profile", label: "Profile", icon: "👤" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`modern-navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="navbar-brand">
          <div className="logo-wrapper">
            <div className="logo-icon">
              <span className="logo-letter">E</span>
            </div>
            <div className="logo-text">
              <span className="brand-name">E-Book</span>
              <span className="brand-subtitle">Store</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div
          className={`navbar-links ${isMobileMenuOpen ? "mobile-open" : ""}`}
        >
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${activeLink === link.path ? "active" : ""}`}
              style={{ "--item-index": index }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
              <div className="nav-indicator"></div>
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <button onClick={handleLogout} className="logout-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.3333 14.1667L17.5 10L13.3333 5.83333"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.5 10H7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isMobileMenuOpen ? "open" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Animated Background Elements */}
      <div className="navbar-bg-effects">
        <div className="bg-gradient"></div>
        <div className="bg-blur"></div>
      </div>
    </nav>
  );
};

export default Navbar;
