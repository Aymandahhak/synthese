import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChartLine, FaGraduationCap, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Responsable DR</h3>
      </div>
      
      <nav className="sidebar-nav">
        <Link 
          to="/responsable-dr/dashboard" 
          className={`nav-link ${isActive('/responsable-dr/dashboard') ? 'active' : ''}`}
        >
          <FaChartLine className="me-2" />
          Dashboard
        </Link>

        <Link 
          to="/responsable-dr/formation" 
          className={`nav-link ${isActive('/responsable-dr/formation') ? 'active' : ''}`}
        >
          <FaGraduationCap className="me-2" />
          Formation
        </Link>

        <Link 
          to="/responsable-dr/rapports" 
          className={`nav-link ${isActive('/responsable-dr/rapports') ? 'active' : ''}`}
        >
          <FaFileAlt className="me-2" />
          Rapports
        </Link>

        <button 
          onClick={handleLogout}
          className="nav-link logout-link"
        >
          <FaSignOutAlt className="me-2" />
          Déconnexion
        </button>
      </nav>

      <style jsx>{`
        .sidebar {
          width: 280px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: #ffffff;
          color: #333;
          padding: 1rem;
          transition: all 0.3s ease;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          color: #666;
          text-decoration: none;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 1rem;
          text-align: left;
        }

        .nav-link:hover {
          background: #f0f7ff;
          color: #0d6efd;
        }

        .nav-link.active {
          background: #0d6efd;
          color: white;
        }

        .logout-link {
          margin-top: auto;
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .logout-link:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 80px;
          }

          .sidebar-header h3 {
            display: none;
          }

          .nav-link span {
            display: none;
          }

          .logout-link {
            display: flex;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SideBar; 