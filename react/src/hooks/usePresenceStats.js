import { useState, useEffect } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch and manage presence statistics data
 * Combines static examples with API data
 * 
 * @returns {object} Presence stats data, loading state, and error state
 */
export const usePresenceStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPresenceStats = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API - now returns fallback data on error
        const response = await publicApi.getPresenceStats();
        
        // Check if the response has a data property, which is common in Laravel responses
        const apiStats = response.data || response || {};
        
        // Add any extra UI-specific data transformations if needed
        if (apiStats && typeof apiStats === 'object') {
          // For example, format percentages, dates, etc.
          if (apiStats.presence_rate) {
            apiStats.presence_rate_formatted = `${apiStats.presence_rate}%`;
          }
          
          // Here we could add color coding or status descriptions based on stats
        }
        
        // Set the stats data
        setStats(apiStats);
        setError(null);
      } catch (err) {
        console.error('Error in usePresenceStats hook:', err);
        
        // If there's an uncaught error, fallback to static example
        const staticStats = {
          total_sessions: 25,
          presence_rate: 85,
          presence_rate_formatted: '85%',
          sessions_by_month: [
            { month: 'Jan', count: 2 },
            { month: 'Fév', count: 3 },
            { month: 'Mar', count: 4 },
            { month: 'Avr', count: 3 },
            { month: 'Mai', count: 5 },
            { month: 'Juin', count: 8 }
          ],
          recent_absences: [
            { formateur: 'Karim Bennani', date: '2023-05-20', session: 'Laravel Basics' },
            { formateur: 'Sara Amrani', date: '2023-05-18', session: 'JavaScript ES6' }
          ]
        };
        
        setStats(staticStats);
        setError('Failed to load presence statistics from API. Showing example data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPresenceStats();
  }, []);

  return { stats, loading, error };
};

export default usePresenceStats; 