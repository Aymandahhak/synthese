import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUserTie, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import { BsCalendarCheck, BsGeoAlt, BsPeople } from 'react-icons/bs';
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
        <div className="page-content">
          <div className="loading-container">
            <div className="text-center loading-content">
              <Spinner 
                animation="border" 
                variant="primary" 
                style={{ width: '2.5rem', height: '2.5rem' }}
              />
              <h6 className="mt-3 text-primary fw-normal">Chargement en cours...</h6>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <div className="dashboard-container">
          {/* Header Section */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Tableau de bord</h1>
              <p className="dashboard-subtitle">Vue d'ensemble de vos activités</p>
            </div>
            <Button 
              variant="primary" 
              className="add-formation-btn"
              onClick={() => navigate('/formations/add')}
            >
              <FaPlus className="me-2" /> Nouvelle Formation
            </Button>
          </div>

          {error && (
            <Alert variant="danger" className="dashboard-alert">
              {error}
            </Alert>
          )}

          {/* Stats Cards */}
          <Row className="stats-container">
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon-container primary">
                    <FaGraduationCap className="stat-icon" />
                  </div>
                  <h3 className="stat-number">{formations.length}</h3>
                  <p className="stat-label">Formations Totales</p>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{ width: '75%' }}></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon-container success">
                    <FaUserTie className="stat-icon" />
                  </div>
                  <h3 className="stat-number">{formateurs.length}</h3>
                  <p className="stat-label">Formateurs Actifs</p>
                  <div className="stat-progress">
                    <div className="progress-bar success" style={{ width: '60%' }}></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon-container warning">
                    <BsCalendarCheck className="stat-icon" />
                  </div>
                  <h3 className="stat-number">
                    {formations.filter(f => f.statut?.toLowerCase() === 'pending').length}
                  </h3>
                  <p className="stat-label">En Attente</p>
                  <div className="stat-progress">
                    <div className="progress-bar warning" style={{ width: '45%' }}></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon-container info">
                    <FaChartLine className="stat-icon" />
                  </div>
                  <h3 className="stat-number">
                    {formations.filter(f => f.statut?.toLowerCase() === 'approved').length}
                  </h3>
                  <p className="stat-label">Formations Validées</p>
                  <div className="stat-progress">
                    <div className="progress-bar info" style={{ width: '85%' }}></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Formations Table */}
          <Card className="table-card">
            <Card.Header className="table-header">
              <h2 className="table-title">Formations Récentes</h2>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/responsable-cdc/formation')}
              >
                Voir tout
              </Button>
                </Card.Header>
            <Card.Body className="p-0">
                  <div className="table-responsive">
                <table className="table table-hover custom-table">
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
                        <td className="formation-title">{formation.titre}</td>
                            <td>{formatDate(formation.date_debut)}</td>
                            <td>{formatDate(formation.date_fin)}</td>
                        <td>
                          <span className="location-badge">
                            <BsGeoAlt className="me-1" />
                            {formation.lieu}
                          </span>
                        </td>
                        <td>
                          <span className="capacity-badge">
                            <BsPeople className="me-1" />
                            {formation.capacite_max}
                          </span>
                        </td>
                            <td>
                          <Badge bg="info" className="type-badge">
                                {formation.type_formation || 'Non défini'}
                              </Badge>
                            </td>
                            <td>{getStatusBadge(formation.statut)}</td>
                            <td>
                          <div className="action-buttons">
                            <Button variant="light" size="sm" onClick={() => handleViewFormation(formation.id)}>
                                  <FaEye />
                            </Button>
                            <Button variant="light" size="sm" onClick={() => handleEditFormation(formation.id)}>
                                  <FaEdit />
                            </Button>
                            <Button variant="light" size="sm" onClick={() => handleDeleteFormation(formation.id)}>
                                  <FaTrash />
                            </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {formations.length === 0 && (
                          <tr>
                        <td colSpan="8" className="text-center py-4">
                          <p className="mb-0 text-muted">Aucune formation trouvée</p>
                        </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>

          {/* Bottom Stats */}
          <Row className="mt-4">
            <Col lg={6} className="mb-4">
              <Card className="h-100 stats-card">
                <Card.Header className="stats-header">
                  <h3 className="stats-title">Formateurs Récents</h3>
                </Card.Header>
                <ListGroup variant="flush">
                  {formateurs.slice(0, 5).map((formateur) => (
                    <ListGroup.Item key={formateur.id} className="formateur-item">
                      <div className="formateur-info">
                        <div className="formateur-avatar">
                          {formateur.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="formateur-details">
                          <h6 className="mb-0">{formateur.user?.name || 'Non défini'}</h6>
                          <small className="text-muted">{formateur.user?.email}</small>
                        </div>
                      </div>
                      <div className="formateur-badges">
                        <Badge bg="primary" className="specialty-badge">
                            {formateur.specialite || 'Non spécifié'}
                          </Badge>
                        <Badge bg="secondary" className="matricule-badge">
                            {formateur.matricule}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card className="h-100 stats-card">
                <Card.Header className="stats-header">
                  <h3 className="stats-title">Statistiques des Formations</h3>
                </Card.Header>
                <Card.Body>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-value pending">
                        {formations.filter(f => f.statut?.toLowerCase() === 'pending').length}
                      </div>
                      <div className="stat-label">En attente</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value approved">
                        {formations.filter(f => f.statut?.toLowerCase() === 'approved').length}
                      </div>
                      <div className="stat-label">Validées</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value distance">
                        {formations.filter(f => f.type_formation?.toLowerCase() === 'à distance').length}
                      </div>
                      <div className="stat-label">À distance</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value presentiel">
                        {formations.filter(f => f.type_formation?.toLowerCase() === 'présentiel').length}
                      </div>
                      <div className="stat-label">Présentiel</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <style jsx>{`
        .page-content {
          padding: 2rem;
          background: #f8f9fa;
          min-height: 100vh;
          width: 100%;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin-top: -64px;
          background-color: #f8f9fa;
        }

        .loading-content {
          transform: translateY(-32px);
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-title {
          font-size: 2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          color: #6c757d;
          margin-bottom: 0;
        }

        .add-formation-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 500;
        }

        .stats-container {
          margin-bottom: 2rem;
        }

        .stat-card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon-container {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .stat-icon-container.primary { background: rgba(13, 110, 253, 0.1); color: #0d6efd; }
        .stat-icon-container.success { background: rgba(25, 135, 84, 0.1); color: #198754; }
        .stat-icon-container.warning { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
        .stat-icon-container.info { background: rgba(13, 202, 240, 0.1); color: #0dcaf0; }

        .stat-icon {
          font-size: 1.5rem;
        }

        .stat-number {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #2c3e50;
        }

        .stat-label {
          color: #6c757d;
          margin-bottom: 1rem;
        }

        .stat-progress {
          height: 4px;
          background: #f1f3f4;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: #0d6efd;
          border-radius: 2px;
        }

        .progress-bar.success { background: #198754; }
        .progress-bar.warning { background: #ffc107; }
        .progress-bar.info { background: #0dcaf0; }

        .table-card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .table-header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #2c3e50;
        }

        .custom-table {
          margin: 0;
        }

        .custom-table th {
          background: #f8f9fa;
          font-weight: 500;
          color: #6c757d;
          border-bottom: 2px solid #e9ecef;
          padding: 1rem 1.5rem;
        }

        .custom-table td {
          padding: 1rem 1.5rem;
          vertical-align: middle;
        }

        .formation-title {
          font-weight: 500;
          color: #2c3e50;
        }

        .location-badge, .capacity-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .type-badge {
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-buttons button {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .action-buttons button:hover {
          background: #e9ecef;
          color: #0d6efd;
        }

        .stats-card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .stats-header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          padding: 1.5rem;
        }

        .stats-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #2c3e50;
        }

        .formateur-item {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: none;
          border-bottom: 1px solid #e9ecef;
        }

        .formateur-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .formateur-avatar {
          width: 40px;
          height: 40px;
          background: #e9ecef;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #6c757d;
        }

        .formateur-details h6 {
          color: #2c3e50;
        }

        .formateur-badges {
          display: flex;
          gap: 0.5rem;
        }

        .specialty-badge, .matricule-badge {
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stat-value.pending { color: #ffc107; }
        .stat-value.approved { color: #198754; }
        .stat-value.distance { color: #0dcaf0; }
        .stat-value.presentiel { color: #0d6efd; }

        @media (max-width: 1200px) {
          .stats-container {
            margin-bottom: 1rem;
          }
        }

        @media (max-width: 992px) {
          .page-content {
            padding: 1.5rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 1rem;
          }

          .table-responsive {
            margin: 0 -1rem;
          }

          .custom-table td, .custom-table th {
            padding: 0.75rem 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .formateur-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .formateur-badges {
            width: 100%;
            justify-content: flex-start;
          }
        }

        @media (max-width: 576px) {
          .dashboard-title {
            font-size: 1.5rem;
          }

          .stat-card {
            margin-bottom: 1rem;
          }

          .stats-header {
            padding: 1rem;
          }

          .stats-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResponsableCdcDashboard;