import { useState, useEffect } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch and manage absences data
 * Combines static examples with API data
 * 
 * @returns {object} Absences data, loading state, and error state
 */
export const useAbsences = () => {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAbsences = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const response = await publicApi.getAbsences();
        
        // Check if the response has a data property (common in Laravel responses)
        const apiAbsences = response.data || response || [];
        
        // Static example data - keep 2 examples to demonstrate UI with consistent data
        const staticAbsences = [
          {
            id: "static1",
            name: "Hannah Laurent",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9.png",
            department: "Marketing",
            absenceType: "Congé maladie",
            startDate: "2023-04-15",
            endDate: "2023-04-20",
          },
          {
            id: "static2",
            name: "Thomas Martin",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9.png",
            department: "Développement",
            absenceType: "Congé annuel",
            startDate: "2023-04-10",
            endDate: "2023-04-17",
          }
        ];
        
        // Combine static and API data if API data exists
        if (Array.isArray(apiAbsences) && apiAbsences.length > 0) {
          setAbsences([...staticAbsences, ...apiAbsences]);
          setError(null);
        } else {
          // If no API data, just use static data
          setAbsences(staticAbsences);
          // Check if the response has an error message
          if (response.error) {
            setError(response.error);
          }
        }
      } catch (err) {
        console.error('Error in useAbsences hook:', err);
        
        // If there's an uncaught error, fallback to static examples
        const staticAbsences = [
          {
            id: "static1",
            name: "Hannah Laurent",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9.png",
            department: "Marketing",
            absenceType: "Congé maladie",
            startDate: "2023-04-15",
            endDate: "2023-04-20",
          },
          {
            id: "static2",
            name: "Thomas Martin",
            image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capturjje.PNG-Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9.png",
            department: "Développement",
            absenceType: "Congé annuel",
            startDate: "2023-04-10",
            endDate: "2023-04-17",
          }
        ];
        
        setAbsences(staticAbsences);
        setError('Failed to load absences data from API. Showing example data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, []);

  return { absences, loading, error };
};

export default useAbsences; 