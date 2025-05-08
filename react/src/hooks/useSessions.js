import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch and manage sessions data
 * Combines static examples with API data
 * 
 * @param {number} formationId - Optional formation ID to filter sessions
 * @returns {object} Sessions data, loading state, error state, and refresh function
 */
export const useSessions = (formationId = null) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to manually refresh sessions data
  const refreshSessions = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API - now returns fallback data on error
        const response = await publicApi.getSessions();
        
        // Check if the response has a data property, which is common in Laravel responses
        const apiSessions = response.data || response || [];
        
        // Static example data - keep 2 examples to demonstrate UI with consistent data
        const staticSessions = [
          {
            id: "static1",
            formation_id: 1,
            titre: "Session 1: Introduction et fondamentaux",
            date: "2023-12-15",
            heure_debut: "09:00",
            heure_fin: "12:00",
            lieu: "Salle de formation A2",
            formateur_id: 1,
            formateur_nom: "Mohammed Kabbaj"
          },
          {
            id: "static2",
            formation_id: 2,
            titre: "Session 2: Framework et bibliothèques",
            date: "2024-01-10",
            heure_debut: "14:00",
            heure_fin: "17:00",
            lieu: "Salle de formation B3",
            formateur_id: 2,
            formateur_nom: "Fatima Zahra Alami"
          }
        ];
        
        // Filter by formation ID if provided
        let filteredData = [];
        
        if (formationId) {
          // Filter static data
          const filteredStatic = staticSessions.filter(
            session => String(session.formation_id) === String(formationId)
          );
          
          // Filter API data
          const filteredApi = Array.isArray(apiSessions) 
            ? apiSessions.filter(session => String(session.formation_id) === String(formationId))
            : [];
            
          filteredData = [...filteredStatic, ...filteredApi];
        } else {
          // No filter, combine all data
          filteredData = [...staticSessions];
          
          // Add API data if it exists
          if (Array.isArray(apiSessions) && apiSessions.length > 0) {
            filteredData = [...filteredData, ...apiSessions];
          }
        }
        
        setSessions(filteredData);
        setError(null);
      } catch (err) {
        console.error('Error in useSessions hook:', err);
        
        // If there's an uncaught error, fallback to static examples
        const staticSessions = [
          {
            id: "static1",
            formation_id: 1,
            titre: "Session 1: Introduction et fondamentaux",
            date: "2023-12-15",
            heure_debut: "09:00",
            heure_fin: "12:00",
            lieu: "Salle de formation A2",
            formateur_id: 1,
            formateur_nom: "Mohammed Kabbaj"
          },
          {
            id: "static2",
            formation_id: 2,
            titre: "Session 2: Framework et bibliothèques",
            date: "2024-01-10",
            heure_debut: "14:00",
            heure_fin: "17:00",
            lieu: "Salle de formation B3",
            formateur_id: 2,
            formateur_nom: "Fatima Zahra Alami"
          }
        ];
        
        // Filter by formation ID if provided
        if (formationId) {
          const filtered = staticSessions.filter(
            session => String(session.formation_id) === String(formationId)
          );
          setSessions(filtered);
        } else {
          setSessions(staticSessions);
        }
        
        setError('Failed to load sessions data from API. Showing example data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [formationId, refreshKey]); // Re-fetch when formationId changes or refreshKey changes

  return { sessions, loading, error, refreshSessions };
};

export default useSessions; 