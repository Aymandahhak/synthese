import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { 
  FaUserTie, 
  FaSync, 
  FaExclamationTriangle,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { 
  BsFillCalendarDateFill, 
  BsPersonBadgeFill,
  BsGeoAlt,
  BsBook
} from 'react-icons/bs';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Container,
  Table,
  Badge
} from 'react-bootstrap';

const FormateurAnimateurPage = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  // Find formation by ID
  const getFormationById = (formationId) => {
    return formations.find(formation => formation.id === formationId);
  };

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex">
        <SideBar />
        <div className="page-content">
          <Container fluid className="px-4">
            <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
              <p className="mt-3">Chargement des données...</p>
            </div>
          </Container>
      </div>
    </div>
  );
  }

  if (error) {
    return (
      <div className="d-flex">
        <SideBar />
        <div className="page-content">
          <Container fluid className="px-4">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <FaExclamationTriangle className="me-2" />
              <div>{error}</div>
            </div>
          </Container>
      </div>
    </div>
  );
  }

  return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <Container fluid className="px-4">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                <FaUserTie className="me-2" />
                Formateurs Animateurs
              </h1>
              <p className="text-muted">Vue d'ensemble des formateurs animateurs et leurs formations assignées</p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={fetchData}
                className="refresh-btn"
              >
                <FaSync className="me-2" />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Table Content */}
          <Card className="table-card">
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Formateur</th>
                      <th>Formation</th>
                      <th>Période</th>
                      <th>Lieu</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
        {formateurs.map(formateur => {
          const formation = getFormationById(formateur.formation_id);
          
          return (
                        <tr key={formateur.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-3">
                                <div className="avatar">
                                  <BsPersonBadgeFill size={20} />
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-0">{formateur.nom} {formateur.prenom}</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <BsBook className="me-2 text-muted" />
                              {formation ? (
                                <Badge bg="success">{formation.titre}</Badge>
                              ) : (
                                <Badge bg="warning">Non assigné</Badge>
                              )}
                </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <BsFillCalendarDateFill className="me-2 text-muted" />
                  {formation ? (
                                `${formatDate(formation.date_debut)} - ${formatDate(formation.date_fin)}`
                  ) : (
                                '-'
                  )}
                </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <BsGeoAlt className="me-2 text-muted" />
                              {formation ? formation.lieu : '-'}
              </div>
                          </td>
                          <td>
                            {formation && (
                              <Badge bg="info">{formation.type_formation}</Badge>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="outline-primary" size="sm">
                                <FaEdit />
                              </Button>
                              <Button variant="outline-danger" size="sm">
                                <FaTrash />
                              </Button>
            </div>
                          </td>
                        </tr>
          );
        })}
                  </tbody>
                </Table>
            </div>
            </Card.Body>
          </Card>
        </Container>

      <style jsx>{`
          .page-content {
            padding: 2rem 0;
          background: #f8f9fa;
            min-height: 100vh;
            width: 100%;
            margin-top: 64px;
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
            display: flex;
            align-items: center;
          }

          .table-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }

          .refresh-btn {
            display: flex;
            align-items: center;
            border-radius: 10px;
            padding: 0.5rem 1rem;
          }

          .avatar-sm {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
          }

          .avatar {
          width: 100%;
            height: 100%;
            background: #e9ecef;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
          }

          @media (max-width: 992px) {
            .page-header {
              flex-direction: column;
              text-align: center;
              gap: 1rem;
            }

            .page-title {
              justify-content: center;
            }
          }

          @media (max-width: 768px) {
            .page-content {
              padding: 1rem 0;
            }
        }
      `}</style>
      </div>
    </div>
  );
};

export default FormateurAnimateurPage;