import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';

const FormateurAnimateurPage = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch formateurs animateurs data
        const formateurResponse = await fetch('http://127.0.0.1:8000/api/formateurs-animateurs');
        const formateurData = await formateurResponse.json();
        
        // Fetch formations data
        const formationResponse = await fetch('http://127.0.0.1:8000/api/formations');
        const formationData = await formationResponse.json();
        
        if (formateurData.success && formationData.status === "success") {
          setFormateurs(formateurData.data);
          setFormations(formationData.data);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Find formation by ID
  const getFormationById = (formationId) => {
    return formations.find(formation => formation.id === formationId);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) return (
    <div className="formateur-container">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="formateur-container">
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    </div>
  );

  return (
    <div className="d-flex">
    <SideBar /> {/* Barre latérale à gauche */}
    <div className="formateur-container flex-grow-1 p-4">
      <h1 className="text-primary mb-4">Formateurs Animateurs </h1>
      
      <div className="row">
        {formateurs.map(formateur => {
          const formation = getFormationById(formateur.formation_id);
          
          return (
            <div key={formateur.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">{formateur.nom} {formateur.prenom}</h5>
                </div>
                <div className="card-body">
                  {formation ? (
                    <>
                      <h6 className="card-subtitle mb-2 text-muted">Formation assignée</h6>
                      <p className="card-text"><strong>Titre:</strong> {formation.titre}</p>
                      <p className="card-text"><strong>Période:</strong> Du {formatDate(formation.date_debut)} au {formatDate(formation.date_fin)}</p>
                      <p className="card-text"><strong>Lieu:</strong> {formation.lieu}</p>
                      <p className="card-text"><strong>Type:</strong> {formation.type_formation}</p>
                    </>
                  ) : (
                    <p className="card-text text-warning">Aucune formation assignée</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {formateurs.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info" role="alert">
              Aucun formateur animateur trouvé.
            </div>
          </div>
        )}
      </div>
        </div>

      <style jsx>{`
        .formateur-container {
          padding: 1.5rem;
          background: #f8f9fa;
          min-height: 100%;
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default FormateurAnimateurPage;