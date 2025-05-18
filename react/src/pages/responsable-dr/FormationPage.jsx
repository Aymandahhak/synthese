import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { Card, Table, Badge, Popover, OverlayTrigger } from 'react-bootstrap';
import { FaGraduationCap, FaMapMarkerAlt, FaCalendarAlt, FaChalkboardTeacher, FaUser, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';

const DrFormationPage = () => {
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch formations
        const formationsResponse = await axios.get('http://127.0.0.1:8000/api/responsable-cdc/gere-formation');
        const validatedFormations = formationsResponse.data.data.filter(
          formation => formation.statut === 'validated'
        );
        setFormations(validatedFormations);

        // Fetch formateurs
        const formateursResponse = await axios.get('http://127.0.0.1:8000/api/responsable-cdc/formateurs');
        const formateursMap = {};
        formateursResponse.data.data.forEach(formateur => {
          if (!formateursMap[formateur.formation_id]) {
            formateursMap[formateur.formation_id] = [];
          }
          formateursMap[formateur.formation_id].push(formateur.user);
        });
        setFormateurs(formateursMap);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const renderFormateurPopover = (formateurs) => (
    <Popover id="formateur-popover" className="formateur-popover">
      <Popover.Header>Liste des Formateurs</Popover.Header>
      <Popover.Body>
        {formateurs?.map((formateur, index) => (
          <div key={index} className="formateur-popup-item">
            <FaUser className="me-2" />
            {formateur.name}
          </div>
        ))}
      </Popover.Body>
    </Popover>
  );

  return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <div className="container-fluid p-4">
          <div className="header-section mb-4">
            <h2 className="page-title">
              <FaGraduationCap className="me-2" />
              Formations Validées
            </h2>
          </div>

          <Card className="content-card">
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="custom-table">
                  <thead>
                    <tr>
                      <th>Formation</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th>Lieu</th>
                      <th>Formateurs Animateurs</th>
                      <th>Formateurs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formations.map((formation) => (
                      <tr key={formation.id}>
                        <td>
                          <div className="formation-title">{formation.titre}</div>
                          <Badge bg="success" className="status-badge">
                            {formation.statut}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-secondary" />
                            <div>{new Date(formation.date_debut).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCalendarAlt className="me-2 text-secondary" />
                            <div>{new Date(formation.date_fin).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-secondary" />
                            {formation.lieu}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaChalkboardTeacher className="me-2 text-secondary" />
                            <div>
                              {formation.formateur_animateurs.map((formateur, index) => (
                                <div key={formateur.id}>
                                  {formateur.nom} {formateur.prenom}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <OverlayTrigger
                              trigger="click"
                              placement="left"
                              overlay={renderFormateurPopover(formateurs[formation.id])}
                            >
                              <button className="btn-icon">
                                <FaInfoCircle className="text-secondary" />
                                <span className="ms-2 formateur-count">
                                  {formateurs[formation.id]?.length || 0} formateur(s)
                                </span>
                              </button>
                            </OverlayTrigger>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .page-content {
          margin-left: 280px;
          min-height: 100vh;
          background: #f8f9fa;
          width: 100%;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #2c3e50;
          display: flex;
          align-items: center;
        }

        .content-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .custom-table {
          margin-bottom: 0;
        }

        .custom-table thead th {
          background-color: #f8f9fa;
          color: #495057;
          border: none;
          padding: 1rem;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.875rem;
        }

        .custom-table tbody tr:nth-child(even) {
          background-color: #f8f9fa;
        }

        .custom-table tbody tr:hover {
          background-color: #f2f2f2;
        }

        .custom-table td {
          padding: 1rem;
          vertical-align: middle;
          border-bottom: 1px solid #e9ecef;
        }

        .formation-title {
          font-weight: 500;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .status-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .btn-icon {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          color: #495057;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          color: #212529;
        }

        .formateur-count {
          font-size: 0.875rem;
        }

        .formateur-popover {
          max-width: 300px;
        }

        .formateur-popup-item {
          padding: 0.5rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
        }

        .formateur-popup-item:last-child {
          border-bottom: none;
        }

        @media (max-width: 768px) {
          .page-content {
            margin-left: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default DrFormationPage; 