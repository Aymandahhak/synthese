import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { Card, Table, Badge, Modal, Button } from 'react-bootstrap';
import { FaGraduationCap, FaMapMarkerAlt, FaCalendarAlt, FaChalkboardTeacher, FaUsers, FaInfoCircle, FaUserTie, FaPrint } from 'react-icons/fa';
import axios from 'axios';

const RapportDr = () => {
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState({});
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [showFormateursModal, setShowFormateursModal] = useState(false);
  const [selectedFormationFormateurs, setSelectedFormationFormateurs] = useState([]);
  const [selectedFormationTitle, setSelectedFormationTitle] = useState('');

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

  const handleShowFormateurs = (formation) => {
    setSelectedFormationFormateurs(formateurs[formation.id] || []);
    setSelectedFormationTitle(formation.titre);
    setShowFormateursModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const PrintableTable = ({ formations }) => (
    <div className="printable-content">
      <h1 className="print-title">Liste des Formations</h1>
      <table className="print-table">
        <thead>
          <tr>
            <th className="col-formation">
              <div className="header-formation">Formation</div>
            </th>
            <th className="col-description">Description</th>
            <th className="col-date">Date Début</th>
            <th className="col-date">Date Fin</th>
            <th className="col-lieu">Lieu</th>
            <th className="col-capacite">Cap.</th>
            <th className="col-formateurs">Formateurs</th>
          </tr>
        </thead>
        <tbody>
          {formations.map((formation) => (
            <tr key={formation.id}>
              <td className="col-formation">
                <div className="formation-cell">
                  <div className="formation-title-print">{formation.titre}</div>
                  <div className="status-print">
                    <span className="status-badge-print">{formation.statut}</span>
                  </div>
                </div>
              </td>
              <td className="col-description">
                <div className="description-text">{formation.description}</div>
              </td>
              <td className="col-date">{new Date(formation.date_debut).toLocaleDateString()}</td>
              <td className="col-date">{new Date(formation.date_fin).toLocaleDateString()}</td>
              <td className="col-lieu">{formation.lieu}</td>
              <td className="col-capacite">{formation.capacite_max}</td>
              <td className="col-formateurs">
                <div className="formateurs-text">
                  {formation.formateur_animateurs?.map(f => `${f.nom} ${f.prenom}`).join(', ') || 'Aucun'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <div className="container-fluid p-4">
          <div className="header-section mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="page-title">
                <FaGraduationCap className="me-2" />
                Formations
              </h2>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handlePrint}
                className="print-btn"
              >
                <FaPrint className="me-2" />
                Imprimer PDF
              </Button>
            </div>

            {/* Printable version (hidden by default) */}
            <div className="print-only">
              <PrintableTable formations={formations} />
            </div>

            {/* Regular view (visible on screen) */}
            <div className="screen-only">
              <Card className="content-card mb-4">
                <Card.Body>
                  <div className="table-responsive">
                    <Table hover className="custom-table">
                      <thead>
                        <tr>
                          <th>Formation</th>
                          <th>Description</th>
                          <th>Date Début</th>
                          <th>Date Fin</th>
                          <th>Lieu</th>
                          <th>Capacité</th>
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
                              <div className="description-cell">
                                {formation.description}
                              </div>
                            </td>
                            <td>{new Date(formation.date_debut).toLocaleDateString()}</td>
                            <td>{new Date(formation.date_fin).toLocaleDateString()}</td>
                            <td>{formation.lieu}</td>
                            <td>{formation.capacite_max} participants</td>
                            <td>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleShowFormateurs(formation)}
                              >
                                Voir les formateurs
                              </Button>
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
        </div>
      </div>

      {/* Formateurs Modal */}
      <Modal show={showFormateursModal} onHide={() => setShowFormateursModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Formateurs - {selectedFormationTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFormationFormateurs.length > 0 ? (
            <div className="formateurs-list">
              {selectedFormationFormateurs.map((formateur, index) => (
                <div key={index} className="formateur-item p-2 border-bottom">
                  <FaUsers className="me-2 text-secondary" />
                  {formateur.name}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">Aucun formateur assigné à cette formation.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFormateursModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

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

        .description-cell {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .formateurs-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .formateur-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
        }

        @media (max-width: 768px) {
          .page-content {
            margin-left: 80px;
          }
        }

        .print-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .print-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        /* Print styles */
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }

          .screen-only {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          .page-content {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          .printable-content {
            padding: 0;
            width: 100%;
          }

          .print-title {
            font-size: 18px;
            margin: 10px 0 15px 0;
            text-align: center;
            color: #000;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            page-break-inside: auto;
          }

          .print-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .print-table th {
            background-color: #f0f0f0 !important;
            color: #000;
            font-weight: bold;
            text-transform: uppercase;
            padding: 6px 4px;
            font-size: 9pt;
            border: 0.5px solid #000;
          }

          .header-formation {
            font-size: 9pt;
            font-weight: 700;
            color: #000;
            text-align: left;
            padding: 2px 0;
          }

          .print-table td {
            padding: 6px 4px;
            font-size: 9pt;
            line-height: 1.2;
            vertical-align: top;
            border: 0.5px solid #000;
          }

          .print-table .col-formation {
            width: 15%;
            background-color: #f8f8f8 !important;
          }

          .formation-cell {
            padding: 2px 0;
          }

          .formation-title-print {
            font-size: 9pt;
            font-weight: 700;
            color: #000;
            margin-bottom: 4px;
            line-height: 1.2;
          }

          .print-table .col-description {
            width: 25%;
          }

          .description-text {
            max-height: 60px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
          }

          .print-table .col-date {
            width: 8%;
            white-space: nowrap;
          }

          .print-table .col-lieu {
            width: 12%;
          }

          .print-table .col-capacite {
            width: 5%;
            text-align: center;
          }

          .print-table .col-formateurs {
            width: 19%;
          }

          .formateurs-text {
            max-height: 40px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
          }

          .status-print {
            margin-top: 4px;
          }

          .status-badge-print {
            display: inline-block;
            padding: 2px 4px;
            background-color: #28a745 !important;
            color: #fff !important;
            border-radius: 2px;
            font-size: 8pt;
            font-weight: 600;
            text-transform: uppercase;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }

        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RapportDr; 