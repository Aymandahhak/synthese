import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
  BsSpeedometer2,
  BsBook,
  BsGear,
  BsPeople
} from 'react-icons/bs';

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const sidebarWidth = collapsed ? '70px' : '220px';

  const navItems = [
    { path: '/responsable-cdc/dashboard', name: 'Dashboard', icon: <BsSpeedometer2 /> },
    { path: '/responsable-cdc/formation', name: 'Formation', icon: <BsBook /> },
  ];

  const styles = {
    sidebar: {
      width: sidebarWidth,
      transition: 'width 0.3s',
      background: '#e6f0ff', // bleu très clair, proche du blanc
      color: '#003366', // bleu foncé pour le texte
      minHeight: '100vh',
      borderRight: '1px solid #ccc'
    },
    toggleButton: {
      backgroundColor: '#007BFF',
      color: 'white',
      border: 'none',
    },
    activeLink: {
      backgroundColor: '#007BFF',
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '5px',
    },
    link: {
      color: '#003366',
      padding: '10px 15px',
      borderRadius: '5px',
      marginBottom: '5px',
      transition: '0.2s',
      textDecoration: 'none',
    }
  };

  return (
    <div style={styles.sidebar}>
      <div className="p-3">
        <button onClick={toggleSidebar} className="btn btn-sm w-100 mb-3" style={styles.toggleButton}>
          {collapsed ? '→' : '←'}
        </button>
        <h5 className="text-center">{collapsed ? 'CDC' : 'Responsable CDC'}</h5>
        <Nav className="flex-column mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
                className="d-flex align-items-center"
              >
                {item.icon}
                {!collapsed && <span className="ms-2">{item.name}</span>}
              </Link>
            );
          })}
        </Nav>
      </div>
    </div>
  );
};

export default SideBar;
