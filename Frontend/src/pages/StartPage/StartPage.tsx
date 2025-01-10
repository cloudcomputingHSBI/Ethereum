import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';
import { getAccessibleElections } from '../../api/apiService';

interface Election {
  election_id: number; // Angepasst von id
  name: string; // Angepasst von title
  description: string;
  start_date: string;
  end_date: string;
  is_public: boolean; // Angepasst von isPublic
}

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await getAccessibleElections();
  
        
        setElections(response as Election[]);
      } catch (error) {
        console.error('Fehler beim Laden der Wahlen:', error);
        setElections([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchElections();
  }, []);
  

  const filteredElections = elections.filter((election) =>
    election.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p className="text-center">Lade Wahlen...</p>;
  }

  return (
    <Container>
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
          <p>Herzlich willkommen beim Blockchain Wahlsystem!</p>
        </Col>
      </Row>

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

      <Row>
        {filteredElections.length > 0 ? (
          filteredElections.map((election) => (
            <Col md={4} className="mb-4" key={election.election_id}>
              <Card className="shadow-sm position-relative">
                {!election.is_public && (
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
                  <Card.Title>{election.name}</Card.Title>
                  <Card.Text>{election.description}</Card.Text>
                  <Card.Text className="text-muted">
                    Status: {new Date(election.start_date) > new Date()
                      ? 'Geplant'
                      : new Date(election.end_date) < new Date()
                      ? 'Beendet'
                      : 'Laufend'}
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => navigate(`/election/${election.election_id}`)}>
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