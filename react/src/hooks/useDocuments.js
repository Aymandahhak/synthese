import { useState, useEffect } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch and manage documents data
 * Combines static examples with API data
 * 
 * @returns {object} Documents data, loading state, and error state
 */
export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        
        // Fetch data from API
        const response = await publicApi.getDocuments();
        
        // Check if the response has a data property (common in Laravel responses)
        const apiDocuments = response.data || response || [];
        
        // Static example data - keep 2 examples to demonstrate UI with consistent data
        const staticDocuments = [
          {
            id: "static1",
            title: "Rapport Trimestriel - Formations Q1 2023",
            type: "pdf",
            size: "1.2 MB",
            createdAt: "2023-04-05",
            category: "Rapports",
            url: "/documents/rapport-q1-2023.pdf",
          },
          {
            id: "static2",
            title: "Guide du Formateur - Techniques Pédagogiques",
            type: "docx",
            size: "850 KB",
            createdAt: "2023-03-15",
            category: "Guides",
            url: "/documents/guide-formateur-2023.docx",
          }
        ];
        
        // Combine static and API data if API data exists
        if (Array.isArray(apiDocuments) && apiDocuments.length > 0) {
          setDocuments([...staticDocuments, ...apiDocuments]);
          setError(null);
        } else {
          // If no API data, just use static data
          setDocuments(staticDocuments);
          // Check if the response has an error message
          if (response.error) {
            setError(response.error);
          }
        }
      } catch (err) {
        console.error('Error in useDocuments hook:', err);
        
        // If there's an uncaught error, fallback to static examples
        const staticDocuments = [
          {
            id: "static1",
            title: "Rapport Trimestriel - Formations Q1 2023",
            type: "pdf",
            size: "1.2 MB",
            createdAt: "2023-04-05",
            category: "Rapports",
            url: "/documents/rapport-q1-2023.pdf",
          },
          {
            id: "static2",
            title: "Guide du Formateur - Techniques Pédagogiques",
            type: "docx",
            size: "850 KB",
            createdAt: "2023-03-15",
            category: "Guides",
            url: "/documents/guide-formateur-2023.docx",
          }
        ];
        
        setDocuments(staticDocuments);
        setError('Failed to load documents data from API. Showing example data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return { documents, loading, error };
};

export default useDocuments; 