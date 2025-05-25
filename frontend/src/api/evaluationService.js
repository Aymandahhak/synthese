import api from './axios';

const evaluationService = {
  // Récupérer toutes les évaluations avec filtres optionnels
  getAllEvaluations: async (filters = {}) => {
    try {
      const response = await api.get('/evaluations', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des évaluations:', error);
      throw error;
    }
  },
  
  // Récupérer une évaluation par son ID
  getEvaluationById: async (id) => {
    try {
      const response = await api.get(`/evaluations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'évaluation ${id}:`, error);
      throw error;
    }
  },
  
  // Créer une nouvelle évaluation
  createEvaluation: async (evaluationData) => {
    try {
      const response = await api.post('/evaluations', evaluationData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'évaluation:', error);
      throw error;
    }
  },
  
  // Mettre à jour une évaluation existante
  updateEvaluation: async (id, evaluationData) => {
    try {
      const response = await api.put(`/evaluations/${id}`, evaluationData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'évaluation ${id}:`, error);
      throw error;
    }
  },
  
  // Supprimer une évaluation
  deleteEvaluation: async (id) => {
    try {
      const response = await api.delete(`/evaluations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'évaluation ${id}:`, error);
      throw error;
    }
  },
  
  // Récupérer les évaluations par formation
  getEvaluationsByFormation: async (formationId) => {
    try {
      const response = await api.get('/evaluations', { 
        params: { formation_id: formationId } 
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des évaluations pour la formation ${formationId}:`, error);
      throw error;
    }
  }
};

export default evaluationService; 