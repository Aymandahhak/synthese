import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch and manage formations data
 * Combines static examples with API data
 * 
 * @returns {object} Formations data, loading state, error state, and refresh function
 */
export const useFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to manually refresh formations data
  const refreshFormations = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    console.log("Refreshing formations data...");
  }, []);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        setLoading(true);
        console.log("Fetching formations from API...");
        
        // Fetch data from API - now returns fallback data on error
        const response = await publicApi.getFormations();
        console.log("API response for formations:", response);
        
        // Check if the response has a data property, which is common in Laravel responses
        const apiFormations = response.data || response || [];
        
        // Static example data - keep 1 example to demonstrate UI with consistent data
        const staticFormations = [
          {
            id: "static1",
            titre: "Introduction au Marketing Digital",
            statut: "validee",
            image: "/marketing-digital.jpg",
            description: "Formation sur les techniques marketing numériques",
            date_debut: "2023-12-15",
            date_fin: "2023-12-20"
          }
        ];
        
        // Combine static and API data if API data exists
        if (Array.isArray(apiFormations) && apiFormations.length > 0) {
          console.log(`Found ${apiFormations.length} formations from API`);
          setFormations([...staticFormations, ...apiFormations]);
          setError(null);
        } else {
          // If no API data, just use static data
          console.log("No formations found from API, using static example");
          setFormations(staticFormations);
          // Check if the response has an error message
          if (response.error) {
            setError(response.error);
          }
        }
      } catch (err) {
        console.error('Error in useFormations hook:', err);
        
        // If there's an uncaught error, fallback to static examples
        const staticFormations = [
          {
            id: "static1",
            titre: "Introduction au Marketing Digital",
            statut: "validee",
            image: "/marketing-digital.jpg",
            description: "Formation sur les techniques marketing numériques",
            date_debut: "2023-12-15",
            date_fin: "2023-12-20"
          }
        ];
        
        setFormations(staticFormations);
        setError('Failed to load formations data from API. Showing example data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [refreshKey]); // Re-fetch when refreshKey changes

  return { formations, setFormations, loading, error, refreshFormations };
};

export default useFormations;