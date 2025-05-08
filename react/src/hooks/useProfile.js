import { useState, useEffect } from 'react';
import { publicApi } from '../services/api';

/**
 * Custom hook to fetch and manage the Responsable Formation profile data
 * 
 * @returns {object} Profile data, loading state, and error state
 */
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getResponsableProfile();
        // The getResponsableProfile now returns fallback data instead of throwing errors
        setProfile(data);
        // Only set error if data indicates an error
        if (data.error) {
          setError(data.error);
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Error in useProfile hook:', err);
        setError('Failed to load profile data. Please try again later.');
        // We still have fallback data from the API service so we don't need to set profile to null
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
};

export default useProfile; 