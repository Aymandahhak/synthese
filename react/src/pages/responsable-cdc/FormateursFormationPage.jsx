import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideBar from './SideBar'; 
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Button, Toast, Card } from 'react-bootstrap';
import { BsTrash, BsPersonPlusFill, BsSearch, BsCheckCircleFill, BsPeople, BsCalendar3 } from 'react-icons/bs';


const FormateursFormationPage = () => {
  const { formationId } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedUsers, setAddedUsers] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [existingFormateurs, setExistingFormateurs] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    console.log('Formation ID from URL:', formationId);
  }, [formationId]);

    const fetchData = async () => {
      try {
      setLoading(true);
      
      // Fetch users from the new API endpoint and filter for role: null
      const usersResponse = await axios.get('http://127.0.0.1:8000/api/users');
      const filteredUsers = usersResponse.data.data.filter(user => user.role === null);
      
      // Fetch existing formateurs for this formation
      const formateursResponse = await axios.get('http://127.0.0.1:8000/api/responsable-cdc/formateurs');
      
      // Set filtered users
      setUsers(filteredUsers);
      
      // Create a Map of user_id to formateur data
      const formateurMap = new Map();
      formateursResponse.data.data
        .filter(formateur => formateur.formation_id === parseInt(formationId))
        .forEach(formateur => formateurMap.set(formateur.user_id, formateur));
      
      setExistingFormateurs(formateurMap);
      setAddedUsers(new Set(formateurMap.keys()));
      setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des données');
      setLoading(false);
      console.error('Error fetching data:', err);
      }
    };

  useEffect(() => {
    fetchData();
  }, [formationId]);

  const handleAddFormateur = async (userId) => {
    try {
      const formateurData = {
        user_id: userId,
          formation_id: parseInt(formationId),
        specialite: 'dev',
        matricule: 'E' + Math.floor(1000 + Math.random() * 9000)
      };

      console.log('Sending request with:', formateurData);

      const response = await axios.post('http://127.0.0.1:8000/api/responsable-cdc/formateurs', formateurData);

      console.log('Response:', response.data);

      if (response.data.status === 'success') {
        // Update the existingFormateurs Map with the new formateur data
        setExistingFormateurs(prev => new Map(prev).set(userId, response.data.data));
        setAddedUsers(prev => new Set([...prev, userId]));
        setToastMessage('Formateur ajouté avec succès');
        setToastVariant('success');
      } else {
        setToastMessage(`Erreur: ${response.data.message || 'Erreur inconnue'}`);
        setToastVariant('danger');
      }
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Erreur lors de l\'ajout du formateur';
      
      setToastMessage(`Erreur: ${errorMessage}`);
      setToastVariant('danger');
    }
    setShowToast(true);
  };

  const handleRemoveFormateur = async (userId) => {
    try {
      const formateur = existingFormateurs.get(userId);
      if (!formateur || !formateur.id) {
        throw new Error('Formateur non trouvé');
      }

      const response = await axios.delete(`http://127.0.0.1:8000/api/responsable-cdc/formateurs/${formateur.id}`);

      if (response.data.status === 'success') {
        // Remove from both sets
        setExistingFormateurs(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
        setAddedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        setToastMessage('Formateur retiré avec succès');
        setToastVariant('success');
        } else {
        setToastMessage(`Erreur: ${response.data.message || 'Erreur inconnue'}`);
        setToastVariant('danger');
      }
    } catch (err) {
      console.error('Error removing formateur:', err);
      setToastMessage(`Erreur lors de la suppression: ${err.message}`);
      setToastVariant('danger');
    }
    setShowToast(true);
  };

  // Debug log to check if formationId is available
  useEffect(() => {
    console.log('Current formationId:', formationId);
  }, [formationId]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <div className="loading-container">
          <div className="text-center loading-content">
            <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <h6 className="mt-3 text-primary fw-normal">Chargement en cours...</h6>
          </div>
        </div>
        </div>
      </div>
    );

  if (error) return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <div className="alert alert-danger m-4 shadow-sm">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <div className="container-fluid p-4">
          {/* Header Section */}
          <div className="header-section mb-4">
            <h2 className="page-title">Gestion des Formateurs</h2>
            <p className="text-muted">Gérez les formateurs pour votre formation</p>
            
            <div className="d-flex align-items-center mt-3 stats-row">
              <div className="stat-card me-4">
                <div className="stat-icon">
                  <BsPeople className="text-primary" size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">{existingFormateurs.size}</h3>
                  <p className="stat-label">Formateurs Assignés</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <BsCalendar3 className="text-success" size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-number">{users.length}</h3>
                  <p className="stat-label">Formateurs Disponibles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="search-card mb-4">
            <Card.Body>
              <div className="search-wrapper">
                <BsSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher un formateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
        </div>
            </Card.Body>
          </Card>

          {/* Users Table */}
          <Card className="table-card">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="custom-table">
                  <thead>
                    <tr>
                      <th>Formateur</th>
                      <th>Email</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-name">{user.name}</div>
                          </div>
                        </td>
                        <td className="user-email">{user.email}</td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              variant={existingFormateurs.has(user.id) ? "outline-success" : "primary"}
                              size="sm"
                              onClick={() => handleAddFormateur(user.id)}
                              disabled={existingFormateurs.has(user.id)}
                              className="action-btn"
                            >
                              {existingFormateurs.has(user.id) ? (
                                <>
                                  <BsCheckCircleFill className="me-2" />
                                  Ajouté
                                </>
                              ) : (
                                <>
                                  <BsPersonPlusFill className="me-2" />
                                  Ajouter
                                </>
                              )}
                            </Button>
                            {existingFormateurs.has(user.id) && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleRemoveFormateur(user.id)}
                                className="action-btn ms-2"
                              >
                                <BsTrash />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {filteredUsers.length === 0 && (
                  <div className="empty-state">
                    <BsSearch size={32} className="empty-icon" />
                    <p>Aucun formateur trouvé</p>
              </div>
            )}
          </div>
            </Card.Body>
          </Card>
        </div>

        {/* Toast Notification */}
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          className="custom-toast"
          bg={toastVariant}
        >
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>

      <style jsx>{`
        .page-content {
          background: #f8f9fa;
          min-height: 100vh;
          width: 100%;
        }

        .header-section {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .stats-row {
          gap: 1.5rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          background: white;
          padding: 1.25rem;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          min-width: 200px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          background: rgba(13, 110, 253, 0.1);
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #2c3e50;
        }

        .stat-label {
          color: #6c757d;
          margin-bottom: 0;
          font-size: 0.875rem;
        }

        .search-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #6c757d;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        .search-input:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }

        .table-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          overflow: hidden;
        }

        .custom-table {
          margin-bottom: 0;
        }

        .custom-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
          padding: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .custom-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #e9ecef;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #0d6efd;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .user-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .user-email {
          color: #6c757d;
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #6c757d;
        }

        .empty-icon {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .custom-toast {
          position: fixed;
          top: 1rem;
          right: 1rem;
          min-width: 250px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .loading-content {
          text-align: center;
        }

        @media (max-width: 768px) {
          .stats-row {
            flex-direction: column;
          }

          .stat-card {
            width: 100%;
            margin-bottom: 1rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FormateursFormationPage;
