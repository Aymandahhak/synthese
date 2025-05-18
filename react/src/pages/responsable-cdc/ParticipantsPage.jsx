import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { 
  FaUserTie, 
  FaSearch, 
  FaSync, 
  FaExclamationTriangle,
  FaFilter,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { 
  BsFillCalendarDateFill, 
  BsPersonBadgeFill,
  BsBook,
  BsEnvelope,
  BsPerson
} from 'react-icons/bs';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  InputGroup,
  Badge,
  Container,
  Table
} from 'react-bootstrap';

const ParticipantsPage = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [formations, setFormations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterFormation, setFilterFormation] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const formateurResponse = await fetch('http://127.0.0.1:8000/api/responsable-cdc/formateurs');
      const formationResponse = await fetch('http://127.0.0.1:8000/api/responsable-cdc/gere-formation');
      
      if (!formateurResponse.ok || !formationResponse.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      
      const formateurResult = await formateurResponse.json();
      const formationResult = await formationResponse.json();
      
      if (formateurResult.status === 'success' && formationResult.status === 'success') {
        setFormateurs(formateurResult.data);
        setFormations(formationResult.data);
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFormationTitle = (formation_id) => {
    const formation = formations.find(f => f.id === formation_id);
    return formation ? formation.titre : 'Non assigné';
  };

  const filteredFormateurs = formateurs.filter(formateur => {
    const userName = formateur.user?.name?.toLowerCase() || '';
    const userEmail = formateur.user?.email?.toLowerCase() || '';
    const matricule = formateur.matricule?.toLowerCase() || '';
    const matchesSearch = userName.includes(searchTerm.toLowerCase()) ||
      userEmail.includes(searchTerm.toLowerCase()) ||
                         matricule.includes(searchTerm.toLowerCase());
    
    const matchesFormation = filterFormation === 'all' || 
                            formateur.formation_id === parseInt(filterFormation);
    
    return matchesSearch && matchesFormation;
  });

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
                Gestion des Formateurs
            </h1>
              <p className="text-muted">Vue d'ensemble des formateurs et leurs formations assignées</p>
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

          {/* Search and Filters */}
          <Card className="search-card mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col lg={6} md={6} className="mb-3 mb-md-0">
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent">
                      <FaSearch className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Rechercher un formateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-start-0"
                    />
                  </InputGroup>
                </Col>
                <Col lg={6} md={6} className="mb-3 mb-md-0">
                  <InputGroup>
                    <InputGroup.Text className="bg-transparent">
                      <FaFilter className="text-muted" />
                    </InputGroup.Text>
                    <Form.Select
                      value={filterFormation}
                      onChange={(e) => setFilterFormation(e.target.value)}
                      className="border-start-0"
                    >
                      <option value="all">Toutes les formations</option>
                      {formations.map((formation) => (
                        <option key={formation.id} value={formation.id}>
                          {formation.titre}
                        </option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Results Summary */}
          <div className="results-summary mb-4">
            <p className="mb-0">
              {filteredFormateurs.length} formateur(s) trouvé(s)
              {searchTerm && ` pour "${searchTerm}"`}
            </p>
        </div>

          {/* Table Content */}
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
            <Card className="table-card">
              <Card.Body>
                  <div className="table-responsive">
                  <Table hover className="align-middle">
                    <thead>
                        <tr>
                        <th>Formateur</th>
                        <th>Matricule</th>
                        <th>Email</th>
                        <th>Formation</th>
                        <th>Date d'inscription</th>
                        <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                      {filteredFormateurs.map((formateur) => (
                        <tr key={formateur.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm me-3">
                                <div className="avatar">
                                  <BsPerson size={20} />
                                </div>
                  </div>
                              <div>
                                <h6 className="mb-0">{formateur.user?.name || 'Non défini'}</h6>
              </div>
            </div>
                          </td>
                          <td>
                            <Badge bg="info" className="matricule-badge">
                              <BsPersonBadgeFill className="me-1" />
                              {formateur.matricule || 'Non défini'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <BsEnvelope className="me-2 text-muted" />
                              {formateur.user?.email || 'Non défini'}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <BsBook className="me-2 text-muted" />
                              {getFormationTitle(formateur.formation_id)}
          </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <BsFillCalendarDateFill className="me-2 text-muted" />
                              {formatDate(formateur.created_at)}
        </div>
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
                      ))}
                    </tbody>
                  </Table>
      </div>
              </Card.Body>
            </Card>
          )}
        </Container>

      <style jsx>{`
          .page-content {
            padding: 2rem 0;
          background: #f8f9fa;
            min-height: 100vh;
          width: 100%;
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

          .search-card, .table-card {
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

          .matricule-badge {
            font-weight: 500;
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
          }

          .results-summary {
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

export default ParticipantsPage;