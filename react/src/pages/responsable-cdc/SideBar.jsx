import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChalkboardTeacher, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import {
  BsSpeedometer2,
  BsBook,
  BsPeople,
  BsBoxArrowLeft,
} from 'react-icons/bs';

const SideBar = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { 
      path: '/responsable-cdc/dashboard', 
      name: 'Dashboard', 
      icon: <BsSpeedometer2 />,
      description: 'Vue d\'ensemble'
    },
    { 
      path: '/responsable-cdc/formation', 
      name: 'Formation', 
      icon: <BsBook />,
      description: 'Gestion des formations'
    },
    { 
      path: '/responsable-cdc/participants', 
      name: 'Participants', 
      icon: <BsPeople />,
      description: 'Liste des participants'
    },
    { 
      path: '/responsable-cdc/formateur_animateur', 
      name: 'Formateurs', 
      icon: <FaChalkboardTeacher />,
      description: 'Gestion des formateurs'
    },
  ];

  return (
    <>
    <div className="app-container">
      <div className="page-container">
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <div className="logo-container">
              {!collapsed && <h5 className="logo-text">Responsable CDC</h5>}
              <button className="toggle-btn" onClick={toggleSidebar}>
                {collapsed ? <FaBars /> : <FaTimes />}
        </button>
            </div>
          </div>

          <Nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  title={collapsed ? item.name : ''}
                >
                  <span className="icon">{item.icon}</span>
                  {!collapsed && (
                    <div className="link-content">
                      <span className="link-text">{item.name}</span>
                      <small className="link-description">{item.description}</small>
                    </div>
                  )}
                  {!collapsed && isActive && <div className="active-indicator" />}
              </Link>
            );
          })}
        </Nav>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-link">
              <span className="icon"><BsBoxArrowLeft /></span>
              {!collapsed && <span className="link-text">Déconnexion</span>}
            </button>
          </div>
        </div>

        <main className="main-content">
          {children}
        </main>
        </div>
      </div>

        <style jsx>{`
          .app-container {
            min-height: 100vh;
            display: flex;
          flex-direction: column;
          }

          .page-container {
            display: flex;
            flex: 1;
          }

          .main-content {
            flex: 1;
            padding: 1.5rem;
            margin-left: ${collapsed ? '80px' : '280px'};
            transition: margin-left 0.3s ease;
            background: #f8f9fa;
            min-height: 100vh;
          }

          .sidebar {
            width: 280px;
            height: 100vh;
            background: #FFFFFF;
            color: #333;
            transition: all 0.3s ease;
            position: fixed;
          top: 0;
          left: 0;
            display: flex;
            flex-direction: column;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
            z-index: 100;
          }

          .sidebar.collapsed {
            width: 80px;
          }

          .sidebar-header {
            padding: 1.5rem 1rem;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
          }

          .logo-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .logo-text {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            color: #1a73e8;
            white-space: nowrap;
          }

          .toggle-btn {
            background: transparent;
            border: none;
            color: #1a73e8;
            cursor: pointer;
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: transform 0.3s ease;
            border-radius: 8px;
          }

          .toggle-btn:hover {
            transform: scale(1.1);
            background: #f1f3f4;
          }

          .sidebar-nav {
            flex: 1;
            padding: 1rem 0;
            overflow-y: auto;
          }

          .nav-link {
            display: flex;
            align-items: center;
            padding: 1rem;
            color: #5f6368;
            text-decoration: none;
            transition: all 0.3s ease;
            position: relative;
            margin: 0.2rem 0.8rem;
            border-radius: 12px;
          }

          .nav-link:hover {
            background: #f1f3f4;
            color: #1a73e8;
            transform: translateX(5px);
          }

          .nav-link.active {
            background: #e8f0fe;
            color: #1a73e8;
          }

          .icon {
            font-size: 1.2rem;
            min-width: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .link-content {
            display: flex;
            flex-direction: column;
            margin-left: 0.5rem;
            overflow: hidden;
          }

          .link-text {
            font-weight: 500;
            font-size: 0.95rem;
          }

          .link-description {
            color: #80868b;
            font-size: 0.75rem;
          }

          .active-indicator {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 20px;
            background: #1a73e8;
            border-radius: 4px;
          }

          .sidebar-footer {
            padding: 1rem;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
          }

          .logout-link {
            display: flex;
            align-items: center;
            color: #5f6368;
            text-decoration: none;
            padding: 0.8rem;
            border-radius: 12px;
            transition: all 0.3s ease;
            background: none;
            border: none;
            width: 100%;
            cursor: pointer;
          }

          .logout-link:hover {
            background: #f1f3f4;
            color: #d93025;
          }

          @media (max-width: 768px) {
            .main-content {
              margin-left: 0;
              padding: 1rem;
              width: 100%;
            }

            .sidebar {
              width: ${collapsed ? '0' : '280px'};
              transform: translateX(${collapsed ? '-100%' : '0'});
            }

            .sidebar.collapsed {
              width: 0;
              transform: translateX(-100%);
            }
          }
        `}</style>
    </>
  );
};

export default SideBar;
