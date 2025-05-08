import { useState, useEffect } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch and manage logistics data
 * Combines static examples with API data
 * 
 * @returns {object} Logistics data, loading state, and error state
 */
export const useLogistics = () => {
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogistics = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const response = await publicApi.getLogistics();
        
        // Check if the response has a data property (common in Laravel responses)
        const apiLogistics = response.data || response || [];
        
        // Static example data - keep 2 examples to demonstrate UI with consistent data
        const staticLogistics = [
          {
            id: "static1",
            name: "Salle de formation A2",
            type: "Salle",
            capacity: 30,
            equipment: ["Projecteur", "Tableau blanc", "PC", "WiFi"],
            location: "Bâtiment A, 2ème étage",
            status: "disponible",
            imageUrl: "/rooms/salle-a2.jpg"
          },
          {
            id: "static2",
            name: "Vidéoprojecteur HP HD",
            type: "Équipement",
            serialNumber: "VP-20230115",
            location: "Stock principal",
            status: "disponible",
            lastMaintenance: "2023-01-10",
            imageUrl: "/equipment/projector.jpg"
          }
        ];
        
        // Combine static and API data if API data exists
        if (Array.isArray(apiLogistics) && apiLogistics.length > 0) {
          setLogistics([...staticLogistics, ...apiLogistics]);
          setError(null);
        } else {
          // If no API data, just use static data
          setLogistics(staticLogistics);
          // Check if the response has an error message
          if (response.error) {
            setError(response.error);
          }
        }
      } catch (err) {
        console.error('Error in useLogistics hook:', err);
        
        // If there's an uncaught error, fallback to static examples
        const staticLogistics = [
          {
            id: "static1",
            name: "Salle de formation A2",
            type: "Salle",
            capacity: 30,
            equipment: ["Projecteur", "Tableau blanc", "PC", "WiFi"],
            location: "Bâtiment A, 2ème étage",
            status: "disponible",
            imageUrl: "/rooms/salle-a2.jpg"
          },
          {
            id: "static2",
            name: "Vidéoprojecteur HP HD",
            type: "Équipement",
            serialNumber: "VP-20230115",
            location: "Stock principal",
            status: "disponible",
            lastMaintenance: "2023-01-10",
            imageUrl: "/equipment/projector.jpg"
          }
        ];
        
        setLogistics(staticLogistics);
        setError('Failed to load logistics data from API. Showing example data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogistics();
  }, []);

  return { logistics, loading, error };
};

export default useLogistics; 