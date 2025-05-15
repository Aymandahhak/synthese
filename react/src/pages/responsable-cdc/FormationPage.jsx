import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsTrash, BsPlus, BsPencil, BsEye, BsCalendar, BsGeoAlt, BsPeople, BsBuilding, BsBook, BsCheckCircle, BsXCircle, BsClock } from 'react-icons/bs';
import { Modal, Button, Form, Badge, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SideBar from './SideBar';


// Configuration d'axios avec l'URL de base
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Liste statique des formateurs animateurs
const staticFormateurs = [
  { id: 1, nom: "Ahmed", prenom: "Alami" },
  { id: 2, nom: "Karim", prenom: "Bennani" },
  { id: 3, nom: "Sara", prenom: "Tazi" },
  { id: 4, nom: "Yasmine", prenom: "Idrissi" },
  { id: 5, nom: "Mohammed", prenom: "Berrada" }
];

const FormationPage = () => {
  const [formations, setFormations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [formateurAnimateurs, setFormateurAnimateurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    lieu: '',
    capacite_max: 20,
    region_id: '',
    filiere_id: '',
    type_formation: 'présentiel',
    responsable_id: 1,
    statut: 'pending',
    formateur_id: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchFormations();
    fetchRegions();
    fetchFilieres();
    fetchFormateurAnimateurs();
  }, []);

  const fetchFormations = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/responsable-cdc/gere-formation');
      console.log('Formations:', response.data);
      setFormations(response.data.data);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Erreur lors de la récupération des formations');
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/responsable-cdc/regions');
      setRegions(response.data.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
      alert('Erreur lors de la récupération des régions');
    }
  };

  const fetchFilieres = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/responsable-cdc/filieres');
      setFilieres(response.data.data);
    } catch (error) {
      console.error('Error fetching filieres:', error);
      alert('Erreur lors de la récupération des filières');
    }
  };

  const fetchFormateurAnimateurs = async () => {
    try {
      const response = await axios.get('/api/responsable-cdc/formateur-animateur');
      console.log('Formateur Animateurs:', response.data);
      setFormateurAnimateurs(response.data.data);
    } catch (error) {
      console.error('Error fetching formateur animateurs:', error);
      alert('Erreur lors de la récupération des formateurs animateurs');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when field is modified
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEdit = (formation) => {
    const formateurAnimateur = formation.formateurAnimateurs?.[0];
    setFormData({
      titre: formation.titre,
      description: formation.description || '',
      date_debut: formation.date_debut.split('T')[0],
      date_fin: formation.date_fin.split('T')[0],
      lieu: formation.lieu || '',
      capacite_max: formation.capacite_max,
      region_id: formation.region_id,
      filiere_id: formation.filiere_id,
      type_formation: formation.type_formation,
      responsable_id: formation.responsable_id,
      statut: formation.statut,
      formateur_id: formateurAnimateur ? formateurAnimateur.formateur_animateur_id : ''
    });
    setIsEditing(true);
    setEditingId(formation.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Validation côté client
    const errors = {};
    if (!formData.titre?.trim()) {
      errors.titre = 'Le titre est requis';
    }
    if (!formData.date_debut) {
      errors.date_debut = 'La date de début est requise';
    }
    if (!formData.date_fin) {
      errors.date_fin = 'La date de fin est requise';
    }
    if (!formData.lieu?.trim()) {
      errors.lieu = 'Le lieu est requis';
    }
    if (!formData.region_id) {
      errors.region_id = 'La région est requise';
    }
    if (!formData.filiere_id) {
      errors.filiere_id = 'La filière est requise';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const formationPayload = {
        ...formData,
        titre: formData.titre.trim(),
        description: formData.description?.trim() || '',
        lieu: formData.lieu.trim(),
        region_id: parseInt(formData.region_id),
        filiere_id: parseInt(formData.filiere_id),
        capacite_max: parseInt(formData.capacite_max),
        responsable_id: parseInt(formData.responsable_id),
        type_formation: formData.type_formation,
        statut: formData.statut
      };

      let formationResponse;
      let newFormationId;

      if (isEditing) {
        // Update existing formation
        formationResponse = await axios.put(`/api/responsable-cdc/gere-formation/${editingId}`, formationPayload);
        newFormationId = editingId;
      } else {
        // Create new formation
        formationResponse = await axios.post('/api/responsable-cdc/gere-formation', formationPayload);
        newFormationId = formationResponse.data.data.id;
      }

      // Handle formateur assignment
      if (formData.formateur_id) {
        const selectedFormateur = staticFormateurs.find(f => f.id === parseInt(formData.formateur_id));
        if (selectedFormateur) {
          const formateurData = {
            formation_id: newFormationId,
            formateur_animateur_id: selectedFormateur.id,
            nom: selectedFormateur.nom,
            prenom: selectedFormateur.prenom
          };

          if (isEditing) {
            try {
              // Get existing formateurs for this formation
              const existingFormateursResponse = await axios.get(`/api/responsable-cdc/formateur-animateur?formation_id=${newFormationId}`);
              const existingFormateurs = existingFormateursResponse.data.data || [];
              
              // Delete existing formateurs one by one
              for (const formateur of existingFormateurs) {
                if (formateur.id) {
                  await axios.delete(`/api/responsable-cdc/formateur-animateur/${formateur.id}`);
                }
              }
            } catch (error) {
              console.error('Error handling existing formateurs:', error);
              // Continue with the update even if deletion fails
            }
          }

          // Assign new formateur
          await axios.post('/api/responsable-cdc/formateur-animateur', formateurData);
        }
      }

      alert(isEditing ? 'Formation modifiée avec succès' : 'Formation créée avec succès');
      setShowModal(false);
      fetchFormations();
      resetForm();
    } catch (error) {
      console.error('Error details:', error);
      handleError(error);
    }
  };

  const handleError = (error) => {
    if (error.response?.status === 422) {
      const serverErrors = error.response.data.errors || {};
      const formattedErrors = {};
      Object.keys(serverErrors).forEach(key => {
        formattedErrors[key] = serverErrors[key][0];
      });
      setValidationErrors(formattedErrors);
      const errorMessages = Object.values(formattedErrors).join('\n');
      alert('Erreurs de validation:\n' + errorMessages);
    } else {
      let errorMessage = isEditing ? 
        'Erreur lors de la modification de la formation: ' : 
        'Erreur lors de la création de la formation: ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        await axios.delete(`/api/responsable-cdc/gere-formation/${id}`);
        alert('Formation supprimée avec succès');
        fetchFormations();
      } catch (error) {
        alert('Erreur lors de la suppression de la formation');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      date_debut: '',
      date_fin: '',
      lieu: '',
      capacite_max: 20,
      region_id: '',
      filiere_id: '',
      type_formation: 'présentiel',
      responsable_id: 1,
      statut: 'pending',
      formateur_id: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setValidationErrors({});
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'En attente', icon: <BsClock className="me-1" /> },
      validated: { color: 'success', label: 'Validé', icon: <BsCheckCircle className="me-1" /> },
      rejected: { color: 'danger', label: 'Rejeté', icon: <BsXCircle className="me-1" /> }
    };
    const config = statusConfig[statut] || { color: 'secondary', label: statut, icon: null };
    return (
      <Badge bg={config.color} className="d-inline-flex align-items-center">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getFormateursForFormation = (formationId) => {
    return formateurAnimateurs.filter(fa => fa.formation_id === formationId);
  };

  const handleViewFormateurs = (formationId) => {
    navigate(`/responsable-cdc/formateurs-formation/${formationId}`);
  };

  return (
    <div className="d-flex">
    <SideBar />
    <div className="page-content flex-grow-1">
      <div className="container-fluid">
        {/* Header with Stats */}
        <div className="row mb-4">
          <div className="col-12">
            <Card className="border-0 shadow-sm bg-primary text-white">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="mb-0">Gestion des Formations</h2>
                  <Button 
                    variant="light" 
                    className="d-flex align-items-center gap-2"
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                  >
                    <BsPlus size={20} />
                    Nouvelle Formation
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Formations Grid */}
        <Row xs={1} md={2} lg={3} className="g-4">
          {formations.map((formation) => (
            <Col key={formation.id}>
              <Card className="h-100 border-0 shadow-sm hover-shadow">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <h5 className="card-title text-primary mb-0">{formation.titre}</h5>
                    {getStatusBadge(formation.statut)}
                  </div>
                  
                  <p className="text-muted small mb-3">
                    {formation.description 
                      ? formation.description.length > 100 
                        ? formation.description.substring(0, 100) + '...'
                        : formation.description
                      : 'Aucune description'
                    }
                  </p>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <BsCalendar className="text-primary me-2" />
                      <small>
                        Du {new Date(formation.date_debut).toLocaleDateString()} 
                        au {new Date(formation.date_fin).toLocaleDateString()}
                      </small>
                    </div>
                    
                    <div className="d-flex align-items-center mb-2">
                      <BsGeoAlt className="text-primary me-2" />
                      <small>{formation.lieu || 'Non défini'}</small>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <BsPeople className="text-primary me-2" />
                      <small>{formation.capacite_max} places</small>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <BsBuilding className="text-primary me-2" />
                      <small>{formation.region?.nom || 'Non définie'}</small>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <BsBook className="text-primary me-2" />
                      <small>{formation.filiere?.nom || 'Non définie'}</small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Badge bg="info" className="me-2">{formation.type_formation}</Badge>
                    {formateurAnimateurs
                      .filter(fa => fa.formation_id === formation.id)
                      .map((formateur) => (
                        <Badge 
                          key={formateur.id} 
                          bg="secondary" 
                          className="me-1"
                        >
                          {formateur.nom} {formateur.prenom}
                        </Badge>
                      ))
                    }
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-warning" 
                      size="sm"
                      className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleEdit(formation)}
                    >
                      <BsPencil />
                      Modifier
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleDelete(formation.id)}
                    >
                      <BsTrash />
                      Supprimer
                    </Button>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleViewFormateurs(formation.id)}
                    >
                      <BsEye />
                      Formateurs
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal 
          show={showModal} 
          onHide={() => {
            setShowModal(false);
            resetForm();
          }} 
          size="lg" 
          className="custom-modal"
        >
          <Modal.Header closeButton className="border-0 bg-primary text-white">
            <Modal.Title>
              {isEditing ? 'Modifier la Formation' : 'Nouvelle Formation'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              {/* Section Info Principale */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h6 className="text-primary mb-3">Informations Principales</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>Titre de la formation</Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={formData.titre}
                      onChange={handleInputChange}
                      isInvalid={!!validationErrors.titre}
                      placeholder="Entrez le titre de la formation"
                      className="border-0 shadow-sm"
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.titre}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      isInvalid={!!validationErrors.description}
                      placeholder="Décrivez la formation"
                      className="border-0 shadow-sm"
                    />
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.description}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Section Dates et Capacité */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h6 className="text-primary mb-3">Dates et Capacité</h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <BsCalendar className="me-2" />
                          Date de début
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date_debut"
                          value={formData.date_debut}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.date_debut}
                          className="border-0 shadow-sm"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.date_debut}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <BsCalendar className="me-2" />
                          Date de fin
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date_fin"
                          value={formData.date_fin}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.date_fin}
                          className="border-0 shadow-sm"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.date_fin}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <BsGeoAlt className="me-2" />
                          Lieu
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="lieu"
                          value={formData.lieu}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.lieu}
                          placeholder="Lieu de la formation"
                          className="border-0 shadow-sm"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.lieu}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <BsPeople className="me-2" />
                          Capacité maximale
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="capacite_max"
                          value={formData.capacite_max}
                          onChange={handleInputChange}
                          min="1"
                          isInvalid={!!validationErrors.capacite_max}
                          className="border-0 shadow-sm"
                        />
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.capacite_max}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Section Détails */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h6 className="text-primary mb-3">Détails de la Formation</h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <BsBuilding className="me-2" />
                          Région
                        </Form.Label>
                        <Form.Select
                          name="region_id"
                          value={formData.region_id}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.region_id}
                          className="border-0 shadow-sm"
                        >
                          <option value="">Sélectionner une région</option>
                          {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.nom}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.region_id}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <BsBook className="me-2" />
                          Filière
                        </Form.Label>
                        <Form.Select
                          name="filiere_id"
                          value={formData.filiere_id}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.filiere_id}
                          className="border-0 shadow-sm"
                        >
                          <option value="">Sélectionner une filière</option>
                          {filieres.map((filiere) => (
                            <option key={filiere.id} value={filiere.id}>
                              {filiere.nom}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {validationErrors.filiere_id}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Type de formation</Form.Label>
                    <div className="d-flex gap-2">
                      {['présentiel', 'à distance', 'hybride'].map((type) => (
                        <Button
                          key={type}
                          variant={formData.type_formation === type ? 'primary' : 'outline-primary'}
                          className="flex-grow-1 text-capitalize"
                          onClick={() => setFormData({ ...formData, type_formation: type })}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Statut de la formation</Form.Label>
                    <div className="d-flex gap-2">
                      {[
                        { value: 'pending', label: 'En attente', variant: 'warning', icon: <BsClock className="me-1" /> },
                        { value: 'validated', label: 'Validé', variant: 'success', icon: <BsCheckCircle className="me-1" /> },
                        { value: 'rejected', label: 'Rejeté', variant: 'danger', icon: <BsXCircle className="me-1" /> }
                      ].map((status) => (
                        <Button
                          key={status.value}
                          variant={formData.statut === status.value ? status.variant : `outline-${status.variant}`}
                          className="flex-grow-1 d-flex align-items-center justify-content-center"
                          onClick={() => setFormData({ ...formData, statut: status.value })}
                        >
                          {status.icon}
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Formateur Animateur</Form.Label>
                    <Form.Select
                      name="formateur_id"
                      value={formData.formateur_id}
                      onChange={handleInputChange}
                      isInvalid={!!validationErrors.formateur_id}
                      className="border-0 shadow-sm"
                    >
                      <option value="">Sélectionner un formateur</option>
                      {staticFormateurs.map((formateur) => (
                        <option key={formateur.id} value={formateur.id}>
                          {formateur.nom} {formateur.prenom}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.formateur_id}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-end gap-2">
                <Button 
                  variant="light" 
                  className="px-4"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  className="px-4"
                >
                  {isEditing ? 'Modifier' : 'Créer'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
                        </div>


        <style jsx>{`
          .page-content {
            padding: 1.5rem;
            background: #f8f9fa;
            min-height: 100vh;
            width: 100%;
          }

          .custom-modal .modal-content {
            border: none;
            border-radius: 12px;
            overflow: hidden;
          }

          .shadow-sm {
            box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important;
          }

          .hover-shadow:hover {
            transform: translateY(-2px);
            transition: all 0.3s ease;
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
          }

          @media (max-width: 768px) {
            .page-content {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FormationPage;