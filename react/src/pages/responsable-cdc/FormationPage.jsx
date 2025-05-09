import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaEye, FaUserTie } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideBar from './SideBar';

const FormationPage = () => {
  // États
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFormateur, setSelectedFormateur] = useState("");
  const [formationId, setFormationId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [currentFormation, setCurrentFormation] = useState({
    titre: '',
    description: '',
    date_debut: '', 
    date_fin: '',
    lieu: '',
    capacite_max: 20,
    statut: 'pending', // Changed to match backend expected values
    region_id: '',
    filiere_id: '',
    responsable_id: 2,
    type_formation: 'présentiel' // Added required field
  });
  
  // Map pour stocker les formateurs associés à chaque formation
  const [formationFormateurs, setFormationFormateurs] = useState({});

  // Liste de noms marocains pour les formateurs
  const formateursMarocains = [
    { id: 1, nom: "El Alami", prenom: "Mohammed" },
    { id: 2, nom: "Benani", prenom: "Fatima" },
    { id: 3, nom: "Tazi", prenom: "Ahmed" },
    { id: 4, nom: "Chraibi", prenom: "Leila" },
    { id: 5, nom: "Berrada", prenom: "Youssef" },
    { id: 6, nom: "Fassi", prenom: "Amina" },
    { id: 7, nom: "Bennani", prenom: "Karim" },
    { id: 8, nom: "Alaoui", prenom: "Nadia" },
    { id: 9, nom: "Tahiri", prenom: "Omar" },
    { id: 10, nom: "Ziani", prenom: "Samira" }
  ];

  // Villes marocaines
  const villesMarocaines = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 
    'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'El Jadida', 'Safi',
    'Mohammedia', 'Khouribga', 'Béni Mellal', 'Taza', 'Khémisset',
    'Taourirt', 'Berkane', 'Larache', 'Nador', 'Settat', 'Berrechid'
  ];

  // Régions du Maroc
  const regionsMaroc = [
    { id: 1, nom: 'Casablanca-Settat' },
    { id: 2, nom: 'Rabat-Salé-Kénitra' },
    { id: 3, nom: 'Fès-Meknès' },
    { id: 4, nom: 'Marrakech-Safi' },
    { id: 5, nom: 'Tanger-Tétouan-Al Hoceima' },
    { id: 6, nom: 'Souss-Massa' },
    { id: 7, nom: 'Oriental' },
    { id: 8, nom: 'Béni Mellal-Khénifra' },
    { id: 9, nom: 'Drâa-Tafilalet' },
    { id: 10, nom: 'Guelmim-Oued Noun' },
    { id: 11, nom: 'Laâyoune-Sakia El Hamra' },
    { id: 12, nom: 'Dakhla-Oued Ed-Dahab' }
  ];

  // Filières
  const filieres = [
    { id: 1, nom: 'Développement Web' },
    { id: 2, nom: 'Intelligence Artificielle' },
    { id: 3, nom: 'Cybersécurité' },
    { id: 4, nom: 'Marketing Digital' },
    { id: 5, nom: 'Design Graphique' },
    { id: 6, nom: 'Gestion de Projet' }
  ];

  // Map pour convertir les statuts de l'interface en valeurs backend
  const statusMapping = {
    'en attente': 'pending',
    'validé': 'validated',
    'rejeté': 'rejected'
  };

  // Map pour convertir les statuts du backend en valeurs interface
  const reverseStatusMapping = {
    'pending': 'en attente',
    'validated': 'validé',
    'rejected': 'rejeté'
  };

  // Types de formation
  const typesFormation = ['présentiel', 'à distance', 'hybride'];

  // Fetch des données
  const fetchFormations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/formations');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      
      // Conversion des statuts backend vers les valeurs de l'interface
      const formationsWithConvertedStatus = data.data.map(formation => ({
        ...formation,
        statut: reverseStatusMapping[formation.statut] || formation.statut
      }));
      
      setFormations(formationsWithConvertedStatus);
      
      // Récupérer les formateurs pour chaque formation
      const formateurData = {};
      for (const formation of data.data) {
        const formateur = await fetchFormationFormateur(formation.id);
        if (formateur) {
          formateurData[formation.id] = formateur;
        }
      }
      setFormationFormateurs(formateurData);
      
      setIsLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des formations');
      setIsLoading(false);
      console.error('Erreur:', err);
    }
  };

  const fetchFormateurs = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/formateurs-animateurs');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setFormateurs(data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des formateurs:', err);
    }
  };

  const fetchFormationFormateur = async (formationId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/formations/${formationId}/formateurs`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.data.length > 0 ? data.data[0] : null;
    } catch (err) {
      console.error('Erreur lors du chargement du formateur de la formation:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchFormations();
    fetchFormateurs();
  }, []);

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Conversion du statut de l'interface vers les valeurs du backend
    if (name === 'statut') {
      setCurrentFormation({ ...currentFormation, [name]: statusMapping[value] || value });
    } else {
      setCurrentFormation({ ...currentFormation, [name]: value });
    }
  };

  const handleFormateurSelect = (e) => {
    setSelectedFormateur(e.target.value);
  };

  // Fonctions CRUD
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentFormation({
      titre: '',
      description: '',
      date_debut: '',
      date_fin: '',
      lieu: '',
      capacite_max: 20,
      statut: 'pending',
      region_id: '',
      filiere_id: '',
      responsable_id: 2,
      type_formation: 'présentiel'
    });
    setSelectedFormateur("");
    setShowModal(true);
  };

  const handleEdit = async (formation) => {
    setIsEditing(true);
    setFormationId(formation.id);
    
    const formationData = {
      ...formation,
      date_debut: formation.date_debut.split('T')[0],
      date_fin: formation.date_fin.split('T')[0],
      // Conversion du statut de l'interface vers les valeurs du backend
      statut: statusMapping[formation.statut] || formation.statut
    };
    
    setCurrentFormation(formationData);
    
    // Récupérer le formateur associé à cette formation
    const formationFormateur = formationFormateurs[formation.id];
    if (formationFormateur) {
      setSelectedFormateur(formationFormateur.formateur_animateur_id.toString());
    } else {
      setSelectedFormateur("");
    }
    
    setShowModal(true);
  };

  const handleView = async (formation) => {
    setFormationId(formation.id);
    
    const formationData = {
      ...formation
    };
    
    setCurrentFormation(formationData);
    
    // Récupérer le formateur associé à cette formation
    const formationFormateur = formationFormateurs[formation.id];
    setSelectedFormateur(formationFormateur ? formationFormateur.formateur_animateur_id.toString() : "");
    
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/formations/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        fetchFormations();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = { ...currentFormation };
      
      // Conversion des IDs en nombres entiers
      if (formData.region_id) formData.region_id = parseInt(formData.region_id);
      if (formData.filiere_id) formData.filiere_id = parseInt(formData.filiere_id);
      if (formData.responsable_id) formData.responsable_id = parseInt(formData.responsable_id);
      if (formData.capacite_max) formData.capacite_max = parseInt(formData.capacite_max);
      
      // Affichage des données pour debug
      console.log("Données à envoyer:", formData);
      
      if (isEditing) {
        const response = await fetch(`http://127.0.0.1:8000/api/formations/${formationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur de réponse:', errorData);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Mettre à jour le formateur
        if (selectedFormateur) {
          const selectedFormateurObj = formateursMarocains.find(f => f.id === parseInt(selectedFormateur));
          const formateurResponse = await fetch('http://127.0.0.1:8000/api/formateurs-animateurs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              formation_id: formationId,
              formateur_animateur_id: parseInt(selectedFormateur),
              nom: selectedFormateurObj.nom,
              prenom: selectedFormateurObj.prenom
            }),
          });
          
          if (!formateurResponse.ok) {
            const errorData = await formateurResponse.json();
            console.error('Erreur lors de l\'ajout du formateur:', errorData);
          }
        }
      } else {
        const response = await fetch('http://127.0.0.1:8000/api/formations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Erreur de réponse:', errorData);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        const newFormationId = data.data.id;
        
        // Ajouter le formateur
        if (selectedFormateur) {
          const selectedFormateurObj = formateursMarocains.find(f => f.id === parseInt(selectedFormateur));
          const formateurResponse = await fetch('http://127.0.0.1:8000/api/formateurs-animateurs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              formation_id: newFormationId,
              formateur_animateur_id: parseInt(selectedFormateur),
              nom: selectedFormateurObj.nom,
              prenom: selectedFormateurObj.prenom
            }),
          });
          
          if (!formateurResponse.ok) {
            const errorData = await formateurResponse.json();
            console.error('Erreur lors de l\'ajout du formateur:', errorData);
          }
        }
      }
      
      setShowModal(false);
      fetchFormations();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      alert('Erreur lors de l\'enregistrement: ' + err.message);
    }
  };
  
  const handleManageFormateurs = (formationId, formationTitle) => {
    navigate(`/formateurs-formation/${formationId}`, { 
      state: { formationTitle } 
    });
  };

  // Récupérer le nom du formateur par ID
  const getFormateurName = (id) => {
    const formateur = formateursMarocains.find(f => f.id === parseInt(id));
    return formateur ? `${formateur.prenom} ${formateur.nom}` : 'Non assigné';
  };

  // Obtenir le nom du formateur pour une formation spécifique
  const getFormateurForFormation = (formationId) => {
    const formateur = formationFormateurs[formationId];
    if (formateur) {
      return `${formateur.prenom} ${formateur.nom}`;
    }
    return 'Non assigné';
  };

  // Statut avec couleur
  const getStatusBadge = (status) => {
    switch (status) {
      case 'en attente':
      case 'pending':
        return <span className="badge bg-warning">En attente</span>;
      case 'validé':
      case 'validated':
        return <span className="badge bg-success">Validé</span>;
      case 'rejeté':
      case 'rejected':
        return <span className="badge bg-danger">Rejeté</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
  };

  if (isLoading) return <div className="d-flex justify-content-center"><div className="spinner-border text-primary" role="status"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="d-flex">
      <SideBar />
      <div className="flex-grow-1 p-4">
        <div className="container-fluid mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-primary">Gestion des Formations</h2>
            <button className="btn btn-primary" onClick={handleAdd}>
              <FaPlus className="me-2" /> Ajouter une formation
            </button>
          </div>

          <div className="card shadow">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th>Titre</th>
                      <th>Description</th>
                      <th>Date de début</th>
                      <th>Date de fin</th>
                      <th>Lieu</th>
                      <th>Capacité max</th>
                      <th>Statut</th>
                      <th>Filière</th>
                      <th>Formateur Animateur</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formations.map((formation) => (
                      <tr key={formation.id}>
                        <td>{formation.titre}</td>
                        <td>{formation.description?.length > 50 ? `${formation.description.substring(0, 50)}...` : formation.description}</td>
                        <td>{formatDate(formation.date_debut)}</td>
                        <td>{formatDate(formation.date_fin)}</td>
                        <td>{formation.lieu}</td>
                        <td>{formation.capacite_max}</td>
                        <td>{getStatusBadge(formation.statut)}</td>
                        <td>{formation.filiere?.nom || 'Non défini'}</td>
                        <td>{getFormateurForFormation(formation.id)}</td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-sm btn-outline-info me-1" onClick={() => handleView(formation)}>
                              <FaEye />
                            </button>
                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(formation)}>
                              <FaEdit />
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-success me-1" 
                              onClick={() => handleManageFormateurs(formation.id, formation.titre)}
                              title="Gérer les formateurs"
                            >
                              <FaPlus /> <FaUserTie />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(formation.id)}>
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {formations.length === 0 && (
                      <tr>
                        <td colSpan="10" className="text-center">Aucune formation trouvée</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal de formulaire */}
          {showModal && (
            <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">{isEditing ? 'Modifier la formation' : 'Ajouter une formation'}</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Titre</label>
                        <input
                          type="text"
                          className="form-control"
                          name="titre"
                          value={currentFormation.titre}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={currentFormation.description || ''}
                          onChange={handleInputChange}
                          rows="3"
                        ></textarea>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Date de début</label>
                          <input
                            type="date"
                            className="form-control"
                            name="date_debut"
                            value={currentFormation.date_debut}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Date de fin</label>
                          <input
                            type="date"
                            className="form-control"
                            name="date_fin"
                            value={currentFormation.date_fin}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Lieu</label>
                          <select
                            className="form-select"
                            name="lieu"
                            value={currentFormation.lieu || ''}
                            onChange={handleInputChange}
                          >
                            <option value="">Sélectionnez un lieu</option>
                            {villesMarocaines.map((ville, index) => (
                              <option key={index} value={ville}>{ville}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Capacité maximale</label>
                          <input
                            type="number"
                            className="form-control"
                            name="capacite_max"
                            value={currentFormation.capacite_max}
                            onChange={handleInputChange}
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Filière</label>
                          <select
                            className="form-select"
                            name="filiere_id"
                            value={currentFormation.filiere_id || ''}
                            onChange={handleInputChange}
                          >
                            <option value="">Sélectionnez une filière</option>
                            {filieres.map(filiere => (
                              <option key={filiere.id} value={filiere.id}>{filiere.nom}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Région</label>
                          <select
                            className="form-select"
                            name="region_id"
                            value={currentFormation.region_id || ''}
                            onChange={handleInputChange}
                          >
                            <option value="">Sélectionnez une région</option>
                            {regionsMaroc.map(region => (
                              <option key={region.id} value={region.id}>{region.nom}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Statut</label>
                          <select
                            className="form-select"
                            name="statut"
                            value={reverseStatusMapping[currentFormation.statut] || currentFormation.statut}
                            onChange={handleInputChange}
                          >
                            <option value="en attente">En attente</option>
                            <option value="validé">Validé</option>
                            <option value="rejeté">Rejeté</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Type de formation</label>
                          <select
                            className="form-select"
                            name="type_formation"
                            value={currentFormation.type_formation}
                            onChange={handleInputChange}
                            required
                          >
                            {typesFormation.map((type, index) => (
                              <option key={index} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Formateur Animateur</label>
                        <select
                          className="form-select"
                          onChange={handleFormateurSelect}
                          value={selectedFormateur}
                        >
                          <option value="">Sélectionnez un formateur</option>
                          {formateursMarocains.map(formateur => (
                            <option key={formateur.id} value={formateur.id}>
                              {formateur.prenom} {formateur.nom}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="d-flex justify-content-end mt-4">
                        <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Annuler</button>
                        <button type="submit" className="btn btn-primary">
                          {isEditing ? 'Modifier' : 'Ajouter'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de visualisation des détails */}
          {showViewModal && (
            <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Détails de la formation</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <h4>{currentFormation.titre}</h4>
                    <p className="text-muted">{currentFormation.description}</p>
                    
                    <div className="row mt-4">
                      <div className="col-md-6">
                        <h5>Informations générales</h5>
                        <table className="table table-bordered">
                          <tbody>
                            <tr>
                              <th>Date de début</th>
                              <td>{formatDate(currentFormation.date_debut)}</td>
                            </tr>
                            <tr>
                              <th>Date de fin</th>
                              <td>{formatDate(currentFormation.date_fin)}</td>
                            </tr>
                            <tr>
                              <th>Lieu</th>
                              <td>{currentFormation.lieu || 'Non défini'}</td>
                            </tr>
                            <tr>
                              <th>Capacité maximale</th>
                              <td>{currentFormation.capacite_max}</td>
                            </tr>
                            <tr>
                              <th>Statut</th>
                              <td>{getStatusBadge(currentFormation.statut)}</td>
                            </tr>
                            <tr>
                              <th>Type de formation</th>
                              <td>{currentFormation.type_formation || 'présentiel'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="col-md-6">
                        <h5>Autres informations</h5>
                        <table className="table table-bordered">
                          <tbody>
                            <tr>
                              <th>Filière</th>
                              <td>{currentFormation.filiere?.nom || 'Non défini'}</td>
                            </tr>
                            <tr>
                              <th>Région</th>
                              <td>{currentFormation.region?.nom || 'Non défini'}</td>
                            </tr>
                            <tr>
                              <th>Responsable</th>
                              <td>{currentFormation.responsable?.user?.name || 'Non défini'}</td>
                            </tr>
                            <tr>
                              <th>Formateur Animateur</th>
                              <td>{selectedFormateur ? getFormateurName(selectedFormateur) : 'Non assigné'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormationPage;