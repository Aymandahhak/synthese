import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import SideBar from './SideBar';

const ResponsablePage = () => {
  // Get the sidebar component and width from the SideBar function
  const { sidebarComponent, sidebarWidth } = SideBar();

  return (
    <div className="responsable-container d-flex">
      {/* Render the sidebar */}
      {sidebarComponent}
      
      {/* Content area with proper margin adjustment */}
      <div className="responsable-content" style={{
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.3s ease',
        width: `calc(100% - ${sidebarWidth})`,
        padding: '20px'
      }}>
        <Container fluid>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Row className="mb-4">
                <Col>
                  <h2 className="mb-1">Gestion des Responsables</h2>
                  <p className="text-muted mb-0">Panel d'administration des responsables</p>
                </Col>
              </Row>
              
              <div className="p-4">
                <h3>Hi Responsable</h3>
                <p>Welcome to the Responsable dashboard page.</p>
                
                {/* You can add your responsable management content here */}
                <p>Cette page vous permet de gérer les informations des responsables et d'assigner des formations.</p>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default ResponsablePage;