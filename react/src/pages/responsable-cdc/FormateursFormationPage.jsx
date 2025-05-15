import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideBar from './SideBar'; 
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Button, Toast, Card } from 'react-bootstrap';
import { BsTrash, BsPersonPlusFill, BsSearch, BsCheckCircleFill } from 'react-icons/bs';


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
    <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );

  if (error) return (
    <div className="alert alert-danger m-3">{error}</div>
  );

  return (
    <div className="d-flex">
      <SideBar />
      <div className="flex-grow-1 bg-light min-vh-100">
        <div className="container-fluid p-4">
          {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Gestion des Formateurs</h4>
          </div>

          {/* Search Bar */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body>
              <div className="input-group">
                <span className="input-group-text border-0 bg-white">
                  <BsSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none"
                  placeholder="Rechercher un formateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
        </div>
            </Card.Body>
          </Card>

          {/* Users Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="table align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 ps-4">Formateur</th>
                      <th className="border-0">Email</th>
                      <th className="border-0 text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <BsPersonPlusFill className="text-primary" />
                            </div>
                            <div>{user.name}</div>
                          </div>
                        </td>
                        <td className="text-muted">{user.email}</td>
                        <td className="text-end pe-4">
                          <div className="d-flex gap-2 justify-content-end">
                            <Button
                              variant={existingFormateurs.has(user.id) ? "outline-success" : "primary"}
                              size="sm"
                              onClick={() => handleAddFormateur(user.id)}
                              disabled={existingFormateurs.has(user.id)}
                              className="d-flex align-items-center px-3"
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
                                className="px-3"
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
                  <div className="text-center py-5 text-muted">
                    Aucun utilisateur trouvé
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
          className="position-fixed top-0 end-0 m-3"
          bg={toastVariant}
        >
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default FormateursFormationPage;
