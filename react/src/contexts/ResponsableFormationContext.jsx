import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

// Import services
import * as sessionService from '../services/responsable-formation/sessionService';
import * as absenceService from '../services/responsable-formation/absenceService';
import * as documentService from '../services/responsable-formation/documentService';
import * as logisticService from '../services/responsable-formation/logisticService';
import * as reportService from '../services/responsable-formation/reportService';
import ResponsableFormationService from '../services/responsable-formation/ResponsableFormationService';

// Create the context
const ResponsableFormationContext = createContext();

// Create a custom hook to use the context
export const useResponsableFormation = () => {
  const context = useContext(ResponsableFormationContext);
  if (!context) {
    throw new Error('useResponsableFormation must be used within a ResponsableFormationProvider');
  }
  return context;
};

// Provider component
export const ResponsableFormationProvider = ({ children }) => {
  const { user } = useAuth();
  const [formations, setFormations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [logistique, setLogistique] = useState([]);
  const [reports, setReports] = useState({
    sessionReports: [],
    absenceReports: [],
    formationReports: []
  });
  const [loading, setLoading] = useState({
    formations: false,
    sessions: false,
    absences: false,
    documents: false,
    logistique: false,
    reports: false
  });
  const [error, setError] = useState({
    formations: null,
    sessions: null,
    absences: null,
    documents: null,
    logistique: null,
    reports: null
  });

  // Function to handle API errors
  const handleError = (section, error) => {
    console.error(`Error in ${section}:`, error);
    setError(prev => ({ ...prev, [section]: error.message || 'Une erreur est survenue' }));
    setLoading(prev => ({ ...prev, [section]: false }));
    toast.error(`Erreur: ${error.message || 'Une erreur est survenue'}`);
  };

  // Reset errors
  const resetErrors = (section) => {
    if (section) {
      setError(prev => ({ ...prev, [section]: null }));
    } else {
      setError({
        formations: null,
        sessions: null,
        absences: null,
        documents: null,
        logistique: null,
        reports: null
      });
    }
  };

  // Formation functions
  const fetchFormations = async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, formations: true }));
      resetErrors('formations');
      const response = await ResponsableFormationService.getFormations(params);
      setFormations(response.data);
      return response.data;
    } catch (error) {
      handleError('formations', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, formations: false }));
    }
  };

  // Session functions
  const fetchSessions = async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, sessions: true }));
      resetErrors('sessions');
      const response = await sessionService.getSessions(params);
      setSessions(response.data);
      return response.data;
    } catch (error) {
      handleError('sessions', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  };

  const createSession = async (sessionData) => {
    try {
      setLoading(prev => ({ ...prev, sessions: true }));
      resetErrors('sessions');
      const response = await sessionService.createSession(sessionData);
      // Update sessions state with the new session
      setSessions(prevSessions => [...prevSessions, response.data]);
      toast.success('Session créée avec succès');
      return response.data;
    } catch (error) {
      handleError('sessions', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  };

  const updateSession = async (id, sessionData) => {
    try {
      setLoading(prev => ({ ...prev, sessions: true }));
      resetErrors('sessions');
      const response = await sessionService.updateSession(id, sessionData);
      // Update the sessions state with the updated session
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === id ? response.data : session
        )
      );
      toast.success('Session mise à jour avec succès');
      return response.data;
    } catch (error) {
      handleError('sessions', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  };

  const validateSession = async (id) => {
    try {
      setLoading(prev => ({ ...prev, sessions: true }));
      resetErrors('sessions');
      const response = await sessionService.validateSession(id);
      // Update the sessions state with the validated session
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === id ? response.data : session
        )
      );
      toast.success('Session validée avec succès');
      return response.data;
    } catch (error) {
      handleError('sessions', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  };

  // Absence functions
  const fetchAbsences = async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, absences: true }));
      resetErrors('absences');
      const response = await absenceService.getAbsences(params);
      setAbsences(response.data);
      return response.data;
    } catch (error) {
      handleError('absences', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, absences: false }));
    }
  };

  const fetchAbsencesBySession = async (sessionId) => {
    try {
      setLoading(prev => ({ ...prev, absences: true }));
      resetErrors('absences');
      const response = await absenceService.getAbsencesBySession(sessionId);
      setAbsences(response.data);
      return response.data;
    } catch (error) {
      handleError('absences', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, absences: false }));
    }
  };

  // Document functions
  const fetchDocuments = async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, documents: true }));
      resetErrors('documents');
      const response = await documentService.getDocuments(params);
      setDocuments(response.data);
      return response.data;
    } catch (error) {
      handleError('documents', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  };

  const uploadDocument = async (formData) => {
    try {
      setLoading(prev => ({ ...prev, documents: true }));
      resetErrors('documents');
      const response = await documentService.uploadDocument(formData);
      // Update documents state with the new document
      setDocuments(prevDocs => [...prevDocs, response.data]);
      toast.success('Document téléchargé avec succès');
      return response.data;
    } catch (error) {
      handleError('documents', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, documents: false }));
    }
  };

  // Logistic functions
  const fetchLogistics = async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, logistique: true }));
      resetErrors('logistique');
      const response = await logisticService.getLogisticItems(params);
      setLogistique(response.data);
      return response.data;
    } catch (error) {
      handleError('logistique', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, logistique: false }));
    }
  };

  const createLogisticRequest = async (logisticData) => {
    try {
      setLoading(prev => ({ ...prev, logistique: true }));
      resetErrors('logistique');
      const response = await logisticService.createLogisticRequest(logisticData);
      // Update logistique state with the new request
      setLogistique(prevItems => [...prevItems, response.data]);
      toast.success('Demande logistique créée avec succès');
      return response.data;
    } catch (error) {
      handleError('logistique', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, logistique: false }));
    }
  };

  // Report functions
  const fetchSessionReports = async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, reports: true }));
      resetErrors('reports');
      const response = await reportService.getSessionReports(params);
      setReports(prev => ({ ...prev, sessionReports: response.data }));
      return response.data;
    } catch (error) {
      handleError('reports', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const fetchAbsenceReports = async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, reports: true }));
      resetErrors('reports');
      const response = await reportService.getAbsenceReports(params);
      setReports(prev => ({ ...prev, absenceReports: response.data }));
      return response.data;
    } catch (error) {
      handleError('reports', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const fetchFormationReports = async (params = {}) => {
    try {
      setLoading(prev => ({ ...prev, reports: true }));
      resetErrors('reports');
      const response = await reportService.getFormationPerformanceReports(params);
      setReports(prev => ({ ...prev, formationReports: response.data }));
      return response.data;
    } catch (error) {
      handleError('reports', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  // Export functions directly from services for simplicity
  const {
    exportReportAsPdf,
    exportReportAsExcel,
    getAnalyticsDashboard
  } = reportService;

  // Exposed state and functions
  const value = {
    user,
    // Data
    formations,
    sessions,
    absences,
    documents,
    logistique,
    reports,
    // Loading states
    loading,
    // Error states
    error,
    // Function to reset errors
    resetErrors,
    // Formation actions
    fetchFormations,
    // Session actions
    fetchSessions,
    createSession,
    updateSession,
    validateSession,
    // Absence actions
    fetchAbsences,
    fetchAbsencesBySession,
    // Document actions
    fetchDocuments,
    uploadDocument,
    // Logistic actions
    fetchLogistics,
    createLogisticRequest,
    // Report actions
    fetchSessionReports,
    fetchAbsenceReports,
    fetchFormationReports,
    exportReportAsPdf,
    exportReportAsExcel,
    getAnalyticsDashboard
  };

  return (
    <ResponsableFormationContext.Provider value={value}>
      {children}
    </ResponsableFormationContext.Provider>
  );
};

export default ResponsableFormationContext; 