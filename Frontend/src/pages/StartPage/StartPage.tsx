import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { getAccessibleElections } from '../../api/apiService';
import ElectionDetailsModal from '../../components/Modals/ElectionDetails';
import { Election } from '../../types';


const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  const handleShowModal = (election: Election) => {
    const status = election.start_date && election.end_date
      ? new Date(election.start_date) > new Date()
        ? 'Geplant'
        : new Date(election.end_date) < new Date()
        ? 'Beendet'
        : 'Laufend'
      : 'Unbekannt';
  
      setSelectedElection({
        ...election,
        description: election.description || 'Keine Beschreibung verfügbar.',
        start_date: election.start_date || '', // Standardwert
        end_date: election.end_date || '', // Standardwert
        status,
      });
      
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedElection(null);
  };

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
                {election.password && (
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Diese Wahl ist passwortgeschützt.</Tooltip>}
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
                  <Card.Text>{election.description || 'Keine Beschreibung verfügbar.'}</Card.Text>
                  <Card.Text className="text-muted">
                    Status: {election.start_date && election.end_date
                      ? new Date(election.start_date) > new Date()
                        ? 'Geplant'
                        : new Date(election.end_date) < new Date()
                        ? 'Beendet'
                        : 'Laufend'
                      : 'Unbekannt'}
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button variant="secondary" onClick={() => handleShowModal(election)}>
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

      <ElectionDetailsModal
        show={showModal}
        onClose={handleCloseModal}
        election= {selectedElection}
      />
    </Container>
  );
};

export default StartPage;
