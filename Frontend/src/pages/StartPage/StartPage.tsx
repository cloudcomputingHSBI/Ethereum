import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mockElections] = useState([
    { id: 1, title: 'Präsidentschaftswahl 2024', description: 'Wählen Sie den nächsten Präsidenten.', status: 'geplant', isPublic: true },
    { id: 2, title: 'Bürgermeisterwahl', description: 'Wählen Sie den neuen Bürgermeister Ihrer Stadt.', status: 'laufend', isPublic: false },
    { id: 3, title: 'Klimaschutzabstimmung', description: 'Beteiligung an der Klimaschutzinitiative.', status: 'beendet', isPublic: true },
  ]);

  const filteredElections = mockElections.filter((election) =>
    election.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container>
      {/* Begrüßung und Info */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Willkommen beim Blockchain Wahlsystem!</h1>
            <Button
              variant="outline-primary"
              className="shadow-sm"
              onClick={() => navigate('/createSurvey')}
            >
              Wahl erstellen
            </Button>
          </div>
          <p>
              Herzlich willkommen beim Blockchain Wahlsystem! Hier können Sie einfach und sicher an demokratischen Prozessen teilnehmen oder eigene Umfragen erstellen.
            </p>
            <p>
              Unser Wahlsystem basiert auf Blockchain-Technologie, um maximale Sicherheit und Transparenz zu gewährleisten. Stimmen Sie ab, erstellen Sie Ihre eigene Wahl oder durchsuchen Sie laufende Wahlen.
            </p>
        </Col>
      </Row>

      {/* Suchfeld */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Nach Wahlen suchen..."
            className="shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Col>
      </Row>

      {/* Liste der Wahlen */}
      <Row>
        {filteredElections.length > 0 ? (
          filteredElections.map((election) => (
            <Col md={4} className="mb-4" key={election.id}>
              <Card className="shadow-sm position-relative">
                {!election.isPublic && (
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Diese Wahl ist geschlossen.</Tooltip>}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: 'red',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      🔒
                    </div>
                  </OverlayTrigger>
                )}
                <Card.Body>
                  <Card.Title>{election.title}</Card.Title>
                  <Card.Text>{election.description}</Card.Text>
                  <Card.Text className="text-muted">Status: {election.status}</Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => navigate(`/election/${election.id}`)}>
                      Details ansehen
                    </Button>
                    <Button variant="primary">An Wahl teilnehmen</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-muted">Keine Wahlen gefunden.</p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default StartPage;
