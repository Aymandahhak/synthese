import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from '../../contexts/AuthContext'; // Corrected path
import { useTheme } from "@/contexts/ThemeContext";
import './Header.css'; // Import the external CSS file
import ThreeDLogo from './ThreeDLogo';

// BB8 theme toggle component with the same functionality but new styling
const ThemeToggle = () => {
  // Get theme state and toggle function from context
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <label className="bb8-toggle theme-toggle">
      <input
        className="bb8-toggle__checkbox"
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
      />
      <div className="bb8-toggle__container">
        <div className="bb8-toggle__scenery">
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="bb8-toggle__star"></div>
          <div className="tatto-1"></div>
          <div className="tatto-2"></div>
          <div className="gomrassen"></div>
          <div className="hermes"></div>
          <div className="chenini"></div>
          <div className="bb8-toggle__cloud"></div>
          <div className="bb8-toggle__cloud"></div>
          <div className="bb8-toggle__cloud"></div>
        </div>
        <div className="bb8">
          <div className="bb8__head-container">
            <div className="bb8__antenna"></div>
            <div className="bb8__antenna"></div>
            <div className="bb8__head"></div>
          </div>
          <div className="bb8__body"></div>
        </div>
        <div className="artificial__hidden">
          <div className="bb8__shadow"></div>
        </div>
      </div>
    </label>
  );
};

// Simple profile dropdown component
const ProfileDropdown = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        className="custom-login-button"
        onClick={() => navigate('/login')}
      >
        Login
      </button>
    );
  }

  return (
    <div className="relative profile-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="text-gray-700 dark:text-gray-200 hidden sm:inline">{user?.username || 'User'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl z-10">
          <Link
            to="/profile"
            className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/settings"
            className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <header
      id="app-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-4 shadow-sm" : "py-8"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div
          className="logo-container"
        >
          <Link to="/">
            <ThreeDLogo width={80} height={80} />
          </Link>
        </div>

        <nav className="hidden md:block">
          <ul className="flex gap-12 items-center">
            {/* Regular navigation items (excluding RP) */}
            {navItems.filter(item => !item.special).map((item) => (
              <li
                key={item.name}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `relative text-base md:text-lg font-medium ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    }`
                  }
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:w-full" />
                </NavLink>
              </li>
            ))}

            {/* Standalone RP button with prominent styling */}
            <li>
              <NavLink
                to="/rp"
                className="text-base md:text-lg font-medium px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-md"
              >
                RP
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-md py-4 md:hidden">
            <ul className="flex flex-col items-center gap-4">
              {/* Regular navigation items (excluding RP) */}
              {navItems.filter(item => !item.special).map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-base ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}

              {/* Standalone RP button with prominent styling */}
              <li className="mt-2">
                <NavLink
                  to="/rp"
                  className="block px-6 py-2 text-base bg-green-600 text-white rounded-md hover:bg-green-700 shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  RP
                </NavLink>
              </li>
            </ul>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Removed duplicate RP button here */}
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}