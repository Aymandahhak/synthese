import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsTrash, BsPlus, BsPencil, BsEye, BsCalendar, BsGeoAlt, BsPeople, BsBuilding, BsBook, BsCheckCircle, BsXCircle, BsClock, BsSearch, BsFilter, BsGrid, BsList } from 'react-icons/bs';
import { Modal, Button, Form, Badge, Card, Row, Col, InputGroup } from 'react-bootstrap';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

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

  // Filter formations based on search and filters
  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.lieu?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || formation.statut === filterStatus;
    const matchesType = filterType === 'all' || formation.type_formation === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="d-flex">
    <SideBar />
      <div className="page-content">
        <div className="formations-container">
          {/* Header Section */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Gestion des Formations</h1>
              <p className="page-subtitle">Gérez et suivez toutes vos formations</p>
            </div>
                  <Button 
              variant="primary" 
              className="add-btn"
                    onClick={() => {
                      resetForm();
                      setShowModal(true);
                    }}
                  >
              <BsPlus size={24} className="me-2" />
                    Nouvelle Formation
                  </Button>
                </div>

          {/* Search and Filters Section */}
          <div className="search-section">
            <div className="search-bar">
              <InputGroup>
                <InputGroup.Text className="search-icon">
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </InputGroup>
            </div>
            
            <div className="filters">
              <Form.Select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="validated">Validé</option>
                <option value="rejected">Rejeté</option>
              </Form.Select>

              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tous les types</option>
                <option value="présentiel">Présentiel</option>
                <option value="à distance">À distance</option>
                <option value="hybride">Hybride</option>
              </Form.Select>

              <div className="view-toggle">
                <Button 
                  variant={viewMode === 'grid' ? 'primary' : 'light'}
                  className="view-btn"
                  onClick={() => setViewMode('grid')}
                >
                  <BsGrid />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'primary' : 'light'}
                  className="view-btn"
                  onClick={() => setViewMode('list')}
                >
                  <BsList />
                </Button>
              </div>
          </div>
        </div>

          {/* Results Summary */}
          <div className="results-summary">
            <p className="mb-0">
              {filteredFormations.length} formation(s) trouvée(s)
              {searchTerm && ` pour "${searchTerm}"`}
            </p>
          </div>

          {/* Formations Display */}
          {viewMode === 'grid' ? (
            <Row className="formations-grid">
              {filteredFormations.map((formation) => (
                <Col key={formation.id} lg={4} md={6} className="mb-4">
                  <Card className="formation-card">
                <Card.Body>
                      <div className="formation-header">
                        <h3 className="formation-title">{formation.titre}</h3>
                    {getStatusBadge(formation.statut)}
                  </div>
                  
                      <p className="formation-description">
                    {formation.description 
                      ? formation.description.length > 100 
                        ? formation.description.substring(0, 100) + '...'
                        : formation.description
                      : 'Aucune description'
                    }
                  </p>

                      <div className="formation-details">
                        <div className="detail-item">
                          <BsCalendar className="detail-icon" />
                          <div className="detail-text">
                            <small className="text-muted">Période</small>
                            <p className="mb-0">
                              {new Date(formation.date_debut).toLocaleDateString()} - 
                              {new Date(formation.date_fin).toLocaleDateString()}
                            </p>
                          </div>
                    </div>
                    
                        <div className="detail-item">
                          <BsGeoAlt className="detail-icon" />
                          <div className="detail-text">
                            <small className="text-muted">Lieu</small>
                            <p className="mb-0">{formation.lieu || 'Non défini'}</p>
                          </div>
                    </div>

                        <div className="detail-item">
                          <BsPeople className="detail-icon" />
                          <div className="detail-text">
                            <small className="text-muted">Capacité</small>
                            <p className="mb-0">{formation.capacite_max} places</p>
                          </div>
                    </div>

                        <div className="detail-item">
                          <BsBuilding className="detail-icon" />
                          <div className="detail-text">
                            <small className="text-muted">Région</small>
                            <p className="mb-0">{formation.region?.nom || 'Non définie'}</p>
                          </div>
                    </div>

                        <div className="detail-item">
                          <BsBook className="detail-icon" />
                          <div className="detail-text">
                            <small className="text-muted">Filière</small>
                            <p className="mb-0">{formation.filiere?.nom || 'Non définie'}</p>
                          </div>
                    </div>
                  </div>

                      <div className="formation-tags">
                        <Badge className="type-badge" bg="info">
                          {formation.type_formation}
                        </Badge>
                    {formateurAnimateurs
                      .filter(fa => fa.formation_id === formation.id)
                      .map((formateur) => (
                        <Badge 
                          key={formateur.id} 
                              className="formateur-badge"
                          bg="secondary" 
                        >
                          {formateur.nom} {formateur.prenom}
                        </Badge>
                      ))
                    }
                  </div>

                      <div className="formation-actions">
                    <Button
                          variant="light"
                          className="action-btn edit-btn"
                      onClick={() => handleEdit(formation)}
                    >
                      <BsPencil />
                          <span>Modifier</span>
                    </Button>
                    <Button 
                          variant="light"
                          className="action-btn delete-btn"
                      onClick={() => handleDelete(formation.id)}
                    >
                      <BsTrash />
                          <span>Supprimer</span>
                    </Button>
                    <Button 
                          variant="light"
                          className="action-btn view-btn"
                      onClick={() => handleViewFormateurs(formation.id)}
                    >
                      <BsEye />
                          <span>Formateurs</span>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
          ) : (
            <div className="formations-list">
              {filteredFormations.map((formation) => (
                <Card key={formation.id} className="formation-list-item">
                  <Card.Body>
                    <div className="list-item-content">
                      <div className="list-item-main">
                        <div className="list-item-header">
                          <h3 className="formation-title">{formation.titre}</h3>
                          {getStatusBadge(formation.statut)}
                        </div>
                        <p className="formation-description">
                          {formation.description?.substring(0, 150) || 'Aucune description'}...
                        </p>
                      </div>
                      
                      <div className="list-item-details">
                        <div className="detail-group">
                          <BsCalendar className="detail-icon" />
                          <span>{new Date(formation.date_debut).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-group">
                          <BsGeoAlt className="detail-icon" />
                          <span>{formation.lieu}</span>
                        </div>
                        <div className="detail-group">
                          <BsPeople className="detail-icon" />
                          <span>{formation.capacite_max} places</span>
                        </div>
                      </div>

                      <div className="list-item-actions">
                        <Button variant="light" className="action-btn" onClick={() => handleEdit(formation)}>
                          <BsPencil />
                        </Button>
                        <Button variant="light" className="action-btn" onClick={() => handleDelete(formation.id)}>
                          <BsTrash />
                        </Button>
                        <Button variant="light" className="action-btn" onClick={() => handleViewFormateurs(formation.id)}>
                          <BsEye />
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          {/* Formation Modal */}
        <Modal 
          show={showModal} 
          onHide={() => {
            setShowModal(false);
            resetForm();
          }} 
          size="lg" 
            className="formation-modal"
        >
            <Modal.Header closeButton>
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
                        <Form.Select
                          name="lieu"
                          value={formData.lieu}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.lieu}
                          className="border-0 shadow-sm"
                        >
                          <option value="">Sélectionner un lieu</option>
                          <option value="Casablanca – (ISTA NTIC Casablanca)">Casablanca – (ISTA NTIC Casablanca)</option>
                          <option value="Marrakech – (ISTA NTIC Sidi Youssef Ben Ali)">Marrakech – (ISTA NTIC Sidi Youssef Ben Ali)</option>
                          <option value="Fès – (ISTA 2 Fès)">Fès – (ISTA 2 Fès)</option>
                          <option value="Tanger – (ISGI Tanger - Institut Spécialisé en Gestion et Informatique)">Tanger – (ISGI Tanger - Institut Spécialisé en Gestion et Informatique)</option>
                          <option value="Agadir – (ISTA Agadir Ait Melloul)">Agadir – (ISTA Agadir Ait Melloul)</option>
                          <option value="Oujda – (ISTA Oujda Al Qods)">Oujda – (ISTA Oujda Al Qods)</option>
                        </Form.Select>
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
            padding: 2rem;
            background: #f8f9fa;
            min-height: 100vh;
            width: 100%;
          }

          .formations-container {
            max-width: 1400px;
            margin: 0 auto;
          }

          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .page-title {
            font-size: 2rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.5rem;
          }

          .page-subtitle {
            color: #6c757d;
            margin-bottom: 0;
          }

          .add-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
          }

          .add-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .formations-grid {
            margin: 0 -0.5rem;
          }

          .formation-card {
            height: 100%;
            border: none;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease;
          }

          .formation-card:hover {
            transform: translateY(-5px);
          }

          .formation-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
          }

          .formation-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #2c3e50;
            margin: 0;
          }

          .formation-description {
            color: #6c757d;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }

          .formation-details {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .detail-icon {
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border-radius: 10px;
            color: #0d6efd;
            font-size: 1.1rem;
          }

          .detail-text {
            flex: 1;
          }

          .detail-text small {
            display: block;
            margin-bottom: 0.25rem;
          }

          .formation-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .type-badge {
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            font-weight: 500;
          }

          .formateur-badge {
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            font-weight: 500;
            background: #e9ecef;
            color: #495057;
          }

          .formation-actions {
            display: flex;
            gap: 0.5rem;
          }

          .action-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            border-radius: 10px;
            transition: all 0.2s;
            color: #495057;
          }

          .action-btn:hover {
            background: #e9ecef;
          }

          .edit-btn:hover {
            color: #0d6efd;
          }

          .delete-btn:hover {
            color: #dc3545;
          }

          .view-btn:hover {
            color: #198754;
          }

          .formation-modal .modal-content {
            border: none;
            border-radius: 15px;
            overflow: hidden;
          }

          .formation-modal .modal-header {
            background: #0d6efd;
            color: white;
            border: none;
            padding: 1.5rem;
          }

          .formation-modal .modal-title {
            font-weight: 600;
          }

          .formation-modal .close {
            color: white;
          }

          @media (max-width: 1200px) {
            .formations-container {
              max-width: 100%;
            }
          }

          @media (max-width: 992px) {
            .page-content {
              padding: 1.5rem;
            }

            .page-header {
              flex-direction: column;
              text-align: center;
              gap: 1rem;
            }

            .formations-grid {
              margin: 0;
            }
          }

          @media (max-width: 768px) {
            .page-content {
              padding: 1rem;
            }

            .page-title {
              font-size: 1.75rem;
            }

            .formation-card {
              margin-bottom: 1rem;
            }

            .formation-actions {
              flex-direction: column;
            }

            .action-btn {
              width: 100%;
            }
          }

          @media (max-width: 576px) {
            .page-title {
              font-size: 1.5rem;
            }

            .formation-title {
              font-size: 1.1rem;
            }

            .detail-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }

            .detail-icon {
              width: 30px;
              height: 30px;
              font-size: 1rem;
            }
          }

          .search-section {
            background: white;
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            margin-bottom: 2rem;
          }

          .search-bar {
            margin-bottom: 1rem;
          }

          .search-icon {
            background: transparent;
            border-right: none;
            color: #6c757d;
          }

          .search-input {
            border-left: none;
            padding-left: 0;
          }

          .search-input:focus {
            box-shadow: none;
          }

          .filters {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .filter-select {
            max-width: 200px;
            flex: 1;
          }

          .view-toggle {
            display: flex;
            gap: 0.5rem;
          }

          .view-btn {
            width: 40px;
            height: 40px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
          }

          .results-summary {
            margin-bottom: 1.5rem;
            color: #6c757d;
          }

          .formations-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .formation-list-item {
            border: none;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s;
          }

          .formation-list-item:hover {
            transform: translateY(-2px);
          }

          .list-item-content {
            display: flex;
            align-items: center;
            gap: 2rem;
          }

          .list-item-main {
            flex: 1;
          }

          .list-item-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.5rem;
          }

          .list-item-details {
            display: flex;
            gap: 2rem;
            align-items: center;
          }

          .detail-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #6c757d;
          }

          .list-item-actions {
            display: flex;
            gap: 0.5rem;
          }

          @media (max-width: 992px) {
            .page-content {
              padding: 1.5rem;
            }

            .filters {
              flex-direction: column;
              align-items: stretch;
            }

            .filter-select {
              max-width: 100%;
            }

            .list-item-content {
              flex-direction: column;
              gap: 1rem;
            }

            .list-item-details {
              flex-wrap: wrap;
              gap: 1rem;
            }
          }

          @media (max-width: 768px) {
            .page-content {
              padding: 1rem;
            }

            .search-section {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default FormationPage;