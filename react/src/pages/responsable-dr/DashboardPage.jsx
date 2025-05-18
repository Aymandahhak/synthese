import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { FaChartLine, FaGraduationCap, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaChalkboardTeacher } from 'react-icons/fa';
import axios from 'axios';

const DashboardPage = () => {
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState({});
  const [stats, setStats] = useState({
    totalFormations: 0,
    totalFormateurs: 0,
    totalParticipants: 0,
    prochainesFormations: [],
    formationsParLieu: {}
  });

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

        // Calculate statistics
        const totalFormateurs = new Set(Object.values(formateursMap).flat().map(f => f.id)).size;
        const formationsParLieu = validatedFormations.reduce((acc, formation) => {
          acc[formation.lieu] = (acc[formation.lieu] || 0) + 1;
          return acc;
        }, {});

        // Get upcoming formations (next 30 days)
        const today = new Date();
        const in30Days = new Date();
        in30Days.setDate(today.getDate() + 30);
        const prochainesFormations = validatedFormations
          .filter(formation => {
            const dateDebut = new Date(formation.date_debut);
            return dateDebut >= today && dateDebut <= in30Days;
          })
          .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));

        setStats({
          totalFormations: validatedFormations.length,
          totalFormateurs,
          totalParticipants: validatedFormations.reduce((sum, f) => sum + f.capacite_max, 0),
          prochainesFormations,
          formationsParLieu
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="header-section mb-4">
            <h2 className="page-title">
              <FaChartLine className="me-2" />
              Dashboard
            </h2>
            <p className="text-muted">Vue d'ensemble des formations et statistiques</p>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <FaGraduationCap />
                  </div>
                  <h3 className="stat-number">{stats.totalFormations}</h3>
                  <p className="stat-label">Formations Validées</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <FaChalkboardTeacher />
                  </div>
                  <h3 className="stat-number">{stats.totalFormateurs}</h3>
                  <p className="stat-label">Formateurs</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <h3 className="stat-number">{stats.totalParticipants}</h3>
                  <p className="stat-label">Capacité Totale</p>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={3} md={6} className="mb-4">
              <Card className="stat-card">
                <Card.Body>
                  <div className="stat-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <h3 className="stat-number">{Object.keys(stats.formationsParLieu).length}</h3>
                  <p className="stat-label">Lieux de Formation</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Upcoming Formations */}
          <Row className="mb-4">
            <Col md={8}>
              <Card className="content-card h-100">
                <Card.Body>
                  <h4 className="card-title mb-4">
                    <FaCalendarAlt className="me-2" />
                    Formations à venir (30 jours)
                  </h4>
                  <div className="table-responsive">
                    <Table className="custom-table">
                      <thead>
                        <tr>
                          <th>Formation</th>
                          <th>Date début</th>
                          <th>Lieu</th>
                          <th>Capacité</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.prochainesFormations.map((formation) => (
                          <tr key={formation.id}>
                            <td>{formation.titre}</td>
                            <td>{new Date(formation.date_debut).toLocaleDateString()}</td>
                            <td>{formation.lieu}</td>
                            <td>{formation.capacite_max} participants</td>
                          </tr>
                        ))}
                        {stats.prochainesFormations.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center py-4">
                              Aucune formation prévue dans les 30 prochains jours
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="content-card h-100">
                <Card.Body>
                  <h4 className="card-title mb-4">
                    <FaMapMarkerAlt className="me-2" />
                    Formations par lieu
                  </h4>
                  <div className="locations-list">
                    {Object.entries(stats.formationsParLieu).map(([lieu, count]) => (
                      <div key={lieu} className="location-item">
                        <span className="location-name">{lieu}</span>
                        <span className="location-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
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

        .stat-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-5px);
        }

        .stat-icon {
          font-size: 2rem;
          color: #0d6efd;
          margin-bottom: 1rem;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #6c757d;
          margin: 0;
          font-size: 0.9rem;
        }

        .card-title {
          color: #2c3e50;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .custom-table {
          margin-bottom: 0;
        }

        .custom-table thead th {
          background-color: #f8f9fa;
          color: #495057;
          border: none;
          padding: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .custom-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #e9ecef;
        }

        .locations-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .location-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .location-name {
          color: #495057;
          font-weight: 500;
        }

        .location-count {
          background: #0d6efd;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
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

export default DashboardPage; 