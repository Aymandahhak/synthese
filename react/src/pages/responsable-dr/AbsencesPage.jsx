import React from 'react';
import SideBar from './SideBar';
import { Card, Row, Col } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';

const AbsencesPage = () => {
  return (
    <div className="d-flex">
      <SideBar />
      <div className="page-content">
        <div className="container-fluid p-4">
          {/* Header */}
          <div className="header-section mb-4">
            <h2 className="page-title">
              <FaCalendarAlt className="me-2" />
              Gestion des Absences
            </h2>
            <p className="text-muted">Gérez les absences des formateurs</p>
          </div>

          {/* Content */}
          <Row>
            <Col md={12}>
              <Card className="content-card">
                <Card.Body>
                  <h3>This is Absence Page</h3>
                  <p>Contenu de la page des absences à venir...</p>
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

        @media (max-width: 768px) {
          .page-content {
            margin-left: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default AbsencesPage; 