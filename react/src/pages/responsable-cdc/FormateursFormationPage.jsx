import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaUserPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideBar from './SideBar'; // ✅ Import de la sidebar

const FormateursFormationPage = () => {
  const { formationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const formationTitle = location.state?.formationTitle || 'Formation';

  const [formateurs, setFormateurs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedFormateur, setSelectedFormateur] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/formateur-formations?formation_id=${formationId}`);
        const data = await response.json();
        if (data.success) {
          setFormateurs(data.data);
        } else {
          setError('Erreur lors du chargement des formateurs');
        }

        const usersResponse = await fetch('http://127.0.0.1:8000/api/users');
        const usersData = await usersResponse.json();
        if (usersData.success) {
          setUsers(usersData.data);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement des données');
        setIsLoading(false);
      }
    };

    if (formationId) fetchData();
  }, [formationId]);

  const handleFormateurChange = (e) => setSelectedFormateur(e.target.value);

  const handleAddFormateur = async (e) => {
    e.preventDefault();
    if (!selectedFormateur) {
      alert('Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/formateur-formations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formation_id: parseInt(formationId),
          user_id: parseInt(selectedFormateur),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedResponse = await fetch(`http://127.0.0.1:8000/api/formateur-formations?formation_id=${formationId}`);
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setFormateurs(updatedData.data);
        }
        setShowModal(false);
        setSelectedFormateur('');
      } else {
        alert("Erreur lors de l'ajout du formateur");
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert("Erreur lors de l'ajout du formateur");
    }
  };

  const handleDeleteFormateur = async (formateurId) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce formateur de la formation?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/formateur-formations/${formateurId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFormateurs(formateurs.filter(formateur => formateur.id !== formateurId));
        } else {
          alert('Erreur lors de la suppression du formateur');
        }
      } catch (err) {
        console.error('Erreur:', err);
        alert('Erreur lors de la suppression du formateur');
      }
    }
  };

  const handleBack = () => navigate(-1);

  if (isLoading) {
    return (
      <div className="d-flex">
        <SideBar />
        <div className="container mt-5 flex-grow-1">
          <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex">
        <SideBar />
        <div className="container mt-5 flex-grow-1">
          <div className="alert alert-danger">{error}</div>
          <button className="btn btn-primary" onClick={handleBack}>
            <FaArrowLeft className="me-2" /> Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <SideBar /> {/* ✅ Ajouté ici */}
      <div className="container mt-4 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <button className="btn btn-outline-primary mb-3" onClick={handleBack}>
              <FaArrowLeft className="me-2" /> Retour
            </button>
            <h2 className="mt-2">Formateurs pour: {formationTitle}</h2>
            <p className="text-muted">Gérez les formateurs associés à cette formation</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaUserPlus className="me-2" /> Ajouter un formateur
          </button>
        </div>

        <div className="card shadow">
          <div className="card-body">
            {formateurs.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th>Nom</th>
                      <th>Spécialité</th>
                      <th>Matricule</th>
                      <th>Filière</th>
                      <th>Région</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formateurs.map((formateur) => (
                      <tr key={formateur.id}>
                        <td>{formateur.formateur_name}</td>
                        <td>{formateur.specialite || 'N/A'}</td>
                        <td>{formateur.matricule || 'N/A'}</td>
                        <td>{formateur.filiere_nom || 'N/A'}</td>
                        <td>{formateur.region_nom || 'N/A'}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            onClick={() => handleDeleteFormateur(formateur.id)}
                          >
                            <FaTrash /> Retirer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">
                Aucun formateur n'est associé à cette formation.
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Ajouter un formateur</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddFormateur}>
                    <div className="mb-3">
                      <label htmlFor="formateur" className="form-label">Sélectionner un utilisateur</label>
                      <select
                        id="formateur"
                        className="form-select"
                        value={selectedFormateur}
                        onChange={handleFormateurChange}
                        required
                      >
                        <option value="">-- Choisir un utilisateur --</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.role?.name || 'Sans rôle'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
                        Annuler
                      </button>
                      <button type="submit" className="btn btn-primary">
                        <FaPlus className="me-2" /> Ajouter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormateursFormationPage;
