import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/AuthService'; // Adjust path if needed
import { restoreAuth } from '../services/api'; // Import the auth restoration function

// Create Context
const AuthContext = createContext(null);

// Create Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken')); // Initial state based on token existence
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    // Effect to load user data from localStorage and validate token on initial load
    useEffect(() => {
        const validateAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken) {
                // For development, we'll be more lenient with token validation
                // In production, you would want to validate with the server
                try {
                    // For development purposes, simply restore auth without server validation
                    const hasTokenRestored = restoreAuth();
                    
                    if (hasTokenRestored && storedUser) {
                        try {
                            setUser(JSON.parse(storedUser));
                            setToken(storedToken);
                            setIsAuthenticated(true);
                            console.log('Authentication restored from localStorage');
                        } catch (e) {
                            console.error("Error parsing stored user data:", e);
                            // Clear storage if user data is corrupt
                            clearAuth();
                        }
                    } else {
                        // Token restoration failed
                        clearAuth();
                    }
                } catch (error) {
                    console.error("Token validation error:", error);
                    clearAuth();
                }
            } else {
                // Setup demo mode authentication if needed
                setupDemoAuth();
            }
            
            setIsLoading(false);
        };
        
        validateAuth();
    }, []);

    // Helper to clear authentication state
    const clearAuth = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    // Setup demo authentication for development
    const setupDemoAuth = () => {
        // For development purposes, we'll create a demo user with responsable_formation role
        const demoUser = {
            id: 1,
            name: 'Responsable Formation',
            email: 'responsable.formation@example.com',
            role: { name: 'responsable_formation', id: 2 },
            role_name: 'responsable_formation',
            role_id: 2
        };
        
        // Use a dummy token that won't expire for development
        const demoToken = 'demo_token_for_development';
        
        // Store in localStorage and state
        localStorage.setItem('authToken', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        setUser(demoUser);
        setToken(demoToken);
        setIsAuthenticated(true);
        console.log('Demo authentication set up');
    };

    const login = async (email, password) => {
        try {
            setIsLoading(true);
            const data = await AuthService.login(email, password);
            
            // Ensure we have a user object
            if (!data.user) {
                throw new Error('No user data received');
            }
            
            // Enhanced role handling for all users
            const userData = { ...data.user }; // Create a copy to modify
            
            // Add better debugging for role data
            console.log('Original user data from AuthService:', userData);
            console.log('Role data structure:', userData.role);
            
            // Map role based on email for development accounts
            const devRoleMap = {
                'admin@example.com': { name: 'admin', id: 1 },
                'responsable.formation@example.com': { name: 'responsable_formation', id: 2 },
                'responsable.dr@example.com': { name: 'responsable_dr', id: 3 },
                'responsable.cdc@example.com': { name: 'responsable_cdc', id: 4 },
                'formateur.animateur@example.com': { name: 'formateur_animateur', id: 5 },
                'formateur.participant@example.com': { name: 'formateur_participant', id: 6 }
            };
            
            // Apply specific role mapping based on email for dev accounts
            if (devRoleMap[email.toLowerCase()]) {
                const roleData = devRoleMap[email.toLowerCase()];
                userData.role = roleData;
                userData.role_name = roleData.name;
                userData.role_id = roleData.id;
                console.log(`Applied role mapping for ${email}:`, roleData);
            }
            // Fallback role handling if needed
            else if (!userData.role) {
                // If no role is set, check email pattern for role clues
                if (email.toLowerCase().includes('admin')) {
                    userData.role = { name: 'admin', id: 1 };
                    userData.role_name = 'admin';
                    console.log('Applied admin role based on email pattern');
                }
                else if (email.toLowerCase().includes('formation')) {
                    userData.role = { name: 'responsable_formation', id: 2 };
                    userData.role_name = 'responsable_formation';
                    console.log('Applied responsable_formation role based on email pattern');
                }
                else if (email.toLowerCase().includes('dr')) {
                    userData.role = { name: 'responsable_dr', id: 3 };
                    userData.role_name = 'responsable_dr';
                    console.log('Applied responsable_dr role based on email pattern');
                }
                else if (email.toLowerCase().includes('cdc')) {
                    userData.role = { name: 'responsable_cdc', id: 4 };
                    userData.role_name = 'responsable_cdc';
                    console.log('Applied responsable_cdc role based on email pattern');
                }
                else if (email.toLowerCase().includes('animateur')) {
                    userData.role = { name: 'formateur_animateur', id: 5 };
                    userData.role_name = 'formateur_animateur';
                    console.log('Applied formateur_animateur role based on email pattern');
                }
                else if (email.toLowerCase().includes('participant')) {
                    userData.role = { name: 'formateur_participant', id: 6 };
                    userData.role_name = 'formateur_participant';
                    console.log('Applied formateur_participant role based on email pattern');
                }
            }
            
            // Normalize role data format if coming from the server
            if (userData.role && typeof userData.role === 'object' && userData.role.name) {
                userData.role_name = userData.role.name;
                userData.role_id = userData.role.id;
            } else if (userData.role && typeof userData.role === 'string') {
                userData.role_name = userData.role;
                userData.role = { name: userData.role, id: getRoleIdFromName(userData.role) };
            }
            
            // Store token and user with proper role data
            setToken(data.access_token);
            setUser(userData); // Use our enhanced user data
            setIsAuthenticated(true);
            
            // Store updated user in localStorage for persistence
            localStorage.setItem('authToken', data.access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            return { ...data, user: userData }; // Return enhanced user data for role-based redirect
        } catch (error) {
            console.error("Login failed in context:", error);
            await AuthService.logout();
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to derive role ID from role name
    const getRoleIdFromName = (roleName) => {
        const roleMap = {
            'admin': 1,
            'responsable_formation': 2,
            'responsable_dr': 3,
            'responsable_cdc': 4,
            'formateur_animateur': 5,
            'formateur_participant': 6
        };
        return roleMap[roleName] || 0;
    };

    const logout = async () => {
        try {
            await AuthService.logout();
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Logout failed:", error);
            // Still clear state even if API call fails
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Hook to use Auth Context
export const useAuth = () => {
    return useContext(AuthContext);
}; 