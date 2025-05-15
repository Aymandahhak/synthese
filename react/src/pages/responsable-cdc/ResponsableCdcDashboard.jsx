import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUserTie, FaGraduationCap } from 'react-icons/fa';
import SideBar from './SideBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const ResponsableCdcDashboard = () => {
  // États
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch des données
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch formations
      const formationsResponse = await fetch('http://127.0.0.1:8000/api/responsable-cdc/gere-formation');
      const formateursResponse = await fetch('http://127.0.0.1:8000/api/responsable-cdc/formateurs');
      
      if (!formationsResponse.ok || !formateursResponse.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const formationsData = await formationsResponse.json();
      const formateursData = await formateursResponse.json();
      
      if (formationsData.status === 'success' && formateursData.status === 'success') {
        setFormations(formationsData.data);
        setFormateurs(formateursData.data);
      } else {
        throw new Error('Format de réponse invalide');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
  };

  // Obtenir le badge de statut pour les formations
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning">En attente</Badge>;
      case 'approved':
        return <Badge bg="success">Validé</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejeté</Badge>;
      default:
        return <Badge bg="secondary">{status || 'Non défini'}</Badge>;
    }
  };

  // Actions sur les formations
  const handleViewFormation = (formationId) => {
    navigate(`/formations/${formationId}`);
  };

  const handleEditFormation = (formationId) => {
    navigate(`/formations/edit/${formationId}`);
  };

  const handleDeleteFormation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/responsable-cdc/gere-formation/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchData();
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex">
        <SideBar />
        <div className="flex-grow-1 p-4 d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <SideBar />
      <div className="flex-grow-1 ">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-primary">Tableau de bord - Responsable CDC</h2>
            <Button 
              variant="primary" 
              onClick={() => navigate('/formations/add')}
            >
              <FaPlus className="me-2" /> Ajouter une formation
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-4">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body className="text-center">
                  <FaGraduationCap className="display-1 text-primary mb-3" />
                  <h3>Nombre total de formations</h3>
                  <div className="display-4 text-primary mb-3">{formations.length}</div>
                  <Button variant="outline-primary" onClick={() => navigate('/responsable-cdc/formation')}>
                    Voir toutes les formations
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Body className="text-center">
                  <FaUserTie className="display-1 text-success mb-3" />
                  <h3>Nombre total de formateurs</h3>
                  <div className="display-4 text-success mb-3">{formateurs.length}</div>
                  <Button variant="outline-success" onClick={() => navigate('/responsable-cdc/participants')}>
                    Voir tous les formateurs
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Formations récentes</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Titre</th>
                          <th>Date début</th>
                          <th>Date fin</th>
                          <th>Lieu</th>
                          <th>Capacité</th>
                          <th>Type</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formations.slice(0, 5).map((formation) => (
                          <tr key={formation.id}>
                            <td>{formation.titre}</td>
                            <td>{formatDate(formation.date_debut)}</td>
                            <td>{formatDate(formation.date_fin)}</td>
                            <td>{formation.lieu}</td>
                            <td>{formation.capacite_max}</td>
                            <td>
                              <Badge bg="info">
                                {formation.type_formation || 'Non défini'}
                              </Badge>
                            </td>
                            <td>{getStatusBadge(formation.statut)}</td>
                            <td>
                              <div className="btn-group">
                                <button className="btn btn-sm btn-outline-info me-1" onClick={() => handleViewFormation(formation.id)}>
                                  <FaEye />
                                </button>
                                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditFormation(formation.id)}>
                                  <FaEdit />
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteFormation(formation.id)}>
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {formations.length === 0 && (
                          <tr>
                            <td colSpan="8" className="text-center">Aucune formation trouvée</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Formateurs récents</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {formateurs.slice(0, 5).map((formateur) => (
                    <ListGroup.Item key={formateur.id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold">{formateur.user?.name || 'Non défini'}</div>
                          <div className="text-muted small">{formateur.user?.email}</div>
                        </div>
                        <div>
                          <Badge bg="primary" className="me-2">
                            {formateur.specialite || 'Non spécifié'}
                          </Badge>
                          <Badge bg="secondary">
                            {formateur.matricule}
                        </Badge>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                  {formateurs.length === 0 && (
                    <ListGroup.Item className="text-center">
                      Aucun formateur trouvé
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Statistiques des formations</h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      Formations en attente
                      <Badge bg="warning" pill>
                        {formations.filter(f => f.statut?.toLowerCase() === 'pending').length}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      Formations validées
                      <Badge bg="success" pill>
                        {formations.filter(f => f.statut?.toLowerCase() === 'approved').length}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      Formations à distance
                      <Badge bg="info" pill>
                        {formations.filter(f => f.type_formation?.toLowerCase() === 'à distance').length}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      Formations en présentiel
                      <Badge bg="primary" pill>
                        {formations.filter(f => f.type_formation?.toLowerCase() === 'présentiel').length}
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default ResponsableCdcDashboard;