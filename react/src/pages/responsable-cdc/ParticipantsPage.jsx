import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { FaUserTie, FaSearch, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { BsFillCalendarDateFill, BsPersonBadgeFill } from 'react-icons/bs';
import { MdWorkOutline } from 'react-icons/md';

const ParticipantsPage = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data when component mounts
    fetchFormateurs();
  }, []);

  const fetchFormateurs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/formateur-formations');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const result = await response.json();
      
      if (result.success === true) {
        setFormateurs(result.data);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date to display in a readable format
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter formateurs based on search term
  const filteredFormateurs = formateurs.filter(formateur => {
    const formateurName = formateur.formateur_name?.toLowerCase() || '';
    const matricule = formateur.matricule?.toLowerCase() || '';
    const specialite = formateur.specialite?.toLowerCase() || '';
    
    return (
      formateurName.includes(searchTerm.toLowerCase()) ||
      matricule.includes(searchTerm.toLowerCase()) ||
      specialite.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="d-flex">
      <SideBar />
      <div className="content-area p-4 w-100">
        <div className="container-fluid">
          {/* Header */}
          <div className="row mb-4 align-items-center">
            <div className="col">
              <h1 className="h3 mb-0 text-gray-800">
                <FaUserTie className="me-2" />
                Tableau de bord des formateurs
              </h1>
              <p className="text-muted">Gestion et suivi des formateurs</p>
            </div>
          </div>

          {/* Search and filters row */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom, matricule ou spécialité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <button className="btn btn-outline-secondary" onClick={fetchFormateurs}>
                <FaSync className="me-1" /> Rafraîchir
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="row">
            <div className="col-12">
              <div className="card shadow">
                <div className="card-header bg-white py-3">
                  <h6 className="m-0 fw-bold text-primary">Liste des formateurs</h6>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      <p className="mt-3">Chargement des données...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <FaExclamationTriangle className="me-2" />
                      <div>Erreur: {error}</div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-striped">
                        <thead className="table-light">
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">
                              <FaUserTie className="me-1" /> Nom du formateur
                            </th>
                            <th scope="col">
                              <MdWorkOutline className="me-1" /> Spécialité
                            </th>
                            <th scope="col">
                              <BsPersonBadgeFill className="me-1" /> Matricule
                            </th>
                            <th scope="col">
                              <BsFillCalendarDateFill className="me-1" /> Date de création
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFormateurs.length > 0 ? (
                            filteredFormateurs.map((formateur, index) => (
                              <tr key={formateur.id || index}>
                                <th scope="row">{index + 1}</th>
                                <td>{formateur.formateur_name || 'Non défini'}</td>
                                <td>
                                  {formateur.specialite ? (
                                    <span className="badge bg-info text-dark">
                                      {formateur.specialite}
                                    </span>
                                  ) : (
                                    <span className="text-muted">Non spécifié</span>
                                  )}
                                </td>
                                <td>{formateur.matricule || 'Non défini'}</td>
                                <td>{formatDate(formateur.created_at)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-4">
                                {searchTerm ? (
                                  <div>
                                    <FaSearch className="me-2 text-muted" />
                                    Aucun résultat trouvé pour "{searchTerm}"
                                  </div>
                                ) : (
                                  <div>Aucun formateur disponible</div>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-white border-top-0">
                  <small className="text-muted">
                    Affichage de {filteredFormateurs.length} formateur(s) sur un total de {formateurs.length}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;