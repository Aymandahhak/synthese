import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import SideBar from './SideBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const ResponsableCdcDashboard = () => {
  // États
  const [formations, setFormations] = useState([]);
  const [formationsCount, setFormationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Liste statique des tâches
  const tasks = [
    { id: 1, titre: "Envoyer les convocations aux participants", date_echeance: "2025-05-15", statut: "en cours", priorite: "haute" },
    { id: 2, titre: "Préparer les attestations de formation", date_echeance: "2025-05-20", statut: "non commencé", priorite: "moyenne" },
    { id: 3, titre: "Réserver les salles pour formations de juin", date_echeance: "2025-05-25", statut: "non commencé", priorite: "haute" },
    { id: 4, titre: "Contacter les formateurs pour confirmer leur disponibilité", date_echeance: "2025-05-18", statut: "en cours", priorite: "haute" },
    { id: 5, titre: "Mettre à jour le matériel pédagogique", date_echeance: "2025-06-01", statut: "non commencé", priorite: "moyenne" }
  ];

  // Fetch des données des formations
  const fetchFormations = async () => {
    try {
      setIsLoading(true);
      
      // Simuler la récupération des formations
      // Dans un cas réel, remplacer par de vrais appels API
      const response = await fetch('http://127.0.0.1:8000/api/formations');
      const data = await response.json();
      
      if (data && data.data) {
        setFormations(data.data.slice(0, 10)); // Prendre les 10 premières formations
        setFormationsCount(data.total || data.data.length);
      } else {
        // Données de secours si l'API ne renvoie pas le format attendu
        const mockFormations = getDefaultFormations();
        setFormations(mockFormations);
        setFormationsCount(mockFormations.length);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des formations:', err);
      setError('Erreur lors du chargement des formations. Veuillez réessayer plus tard.');
      
      // Utiliser des données de secours en cas d'erreur
      const mockFormations = getDefaultFormations();
      setFormations(mockFormations);
      setFormationsCount(mockFormations.length);
      
      setIsLoading(false);
    }
  };

  // Formations par défaut (données de secours)
  const getDefaultFormations = () => {
    return [
      { id: 1, titre: "Développement Web Frontend", date_debut: "2025-06-10", date_fin: "2025-06-15", lieu: "Casablanca", capacite_max: 20, statut: "validé" },
      { id: 2, titre: "DevOps et CI/CD", date_debut: "2025-06-15", date_fin: "2025-06-22", lieu: "Rabat", capacite_max: 15, statut: "en attente" },
      { id: 3, titre: "Intelligence Artificielle et Machine Learning", date_debut: "2025-06-20", date_fin: "2025-06-30", lieu: "Marrakech", capacite_max: 18, statut: "validé" },
      { id: 4, titre: "Cybersécurité Avancée", date_debut: "2025-06-25", date_fin: "2025-07-05", lieu: "Tanger", capacite_max: 12, statut: "validé" },
      { id: 5, titre: "Programmation Mobile React Native", date_debut: "2025-07-01", date_fin: "2025-07-10", lieu: "Casablanca", capacite_max: 20, statut: "en attente" },
      { id: 6, titre: "Administration de Bases de Données", date_debut: "2025-07-10", date_fin: "2025-07-17", lieu: "Agadir", capacite_max: 15, statut: "validé" },
      { id: 7, titre: "Architecture Microservices", date_debut: "2025-07-15", date_fin: "2025-07-25", lieu: "Casablanca", capacite_max: 18, statut: "en attente" },
      { id: 8, titre: "UI/UX Design", date_debut: "2025-07-20", date_fin: "2025-07-27", lieu: "Rabat", capacite_max: 20, statut: "validé" },
      { id: 9, titre: "Développement Backend avec Node.js", date_debut: "2025-07-25", date_fin: "2025-08-05", lieu: "Fès", capacite_max: 16, statut: "en attente" },
      { id: 10, titre: "Cloud Computing et AWS", date_debut: "2025-08-01", date_fin: "2025-08-10", lieu: "Casablanca", capacite_max: 15, statut: "validé" }
    ];
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  // Formatage de date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
  };

  // Obtenir le badge de statut pour les formations
  const getStatusBadge = (status) => {
    switch (status) {
      case 'en attente':
        return <Badge bg="warning">En attente</Badge>;
      case 'validé':
        return <Badge bg="success">Validé</Badge>;
      case 'rejeté':
        return <Badge bg="danger">Rejeté</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Obtenir le badge de priorité pour les tâches
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'haute':
        return <Badge bg="danger">Haute</Badge>;
      case 'moyenne':
        return <Badge bg="warning">Moyenne</Badge>;
      case 'basse':
        return <Badge bg="info">Basse</Badge>;
      default:
        return <Badge bg="secondary">{priority}</Badge>;
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
        await fetch(`http://127.0.0.1:8000/api/formations/${id}`, {
          method: 'DELETE',
        });
        fetchFormations();
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
      <div className="flex-grow-1 p-4">
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
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Body className="text-center">
                  <h3>Nombre total de formations</h3>
                  <div className="display-1 text-primary mb-3">{formationsCount}</div>
                  <Button variant="outline-primary" onClick={() => navigate('/responsable-cdc/formation')}>
                    Voir toutes les formations
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Les 10 premières formations</h5>
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
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formations.map((formation) => (
                          <tr key={formation.id}>
                            <td>{formation.titre}</td>
                            <td>{formatDate(formation.date_debut)}</td>
                            <td>{formatDate(formation.date_fin)}</td>
                            <td>{formation.lieu}</td>
                            <td>{formation.capacite_max}</td>
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
                            <td colSpan="7" className="text-center">Aucune formation trouvée</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Mes tâches</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {tasks.map((task) => (
                    <ListGroup.Item key={task.id}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="fw-bold">{task.titre}</div>
                        {getPriorityBadge(task.priorite)}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-muted small">Échéance: {formatDate(task.date_echeance)}</div>
                        <Badge bg={task.statut === 'en cours' ? 'info' : 'secondary'}>
                          {task.statut}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default ResponsableCdcDashboard;