import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { getAccessibleElections, getElectionDetails } from '../../api/apiService';
import { Election } from '../../types';
import { ReactFormGenerator } from 'react-form-builder2';

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [formSchema, setFormSchema] = useState<any>(null);

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

    const saveButton = document.querySelector('.btn-toolbar') as HTMLElement | null;
    if (saveButton) {
      saveButton.style.display = 'none';  
    }

    fetchElections();
  }, [showVotingModal]);

  const handleShowDetailsModal = async (election: Election) => {
    try {
      const electionDetails = await getElectionDetails(election.election_id);
  
      const status =
        election.start_date && election.end_date
          ? new Date(election.start_date) > new Date()
            ? 'Geplant'
            : new Date(election.end_date) < new Date()
            ? 'Beendet'
            : 'Laufend'
          : 'Unbekannt';
  
      setSelectedElection({
        ...electionDetails,
        description: electionDetails.description || 'Keine Beschreibung verfügbar.',
        status,
      });
  
      setShowDetailsModal(true);
    } catch (error) {
      alert('Fehler beim Abrufen der Wahldetails.');
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedElection(null);
  };

  const handleJoinElection = async (election: Election) => {
    try {
      const electionDetails = await getElectionDetails(election.election_id);
      console.log('Wahldetails:', electionDetails);
      setFormSchema(electionDetails.form_schema);
      setSelectedElection(election);
      setShowVotingModal(true);
    } catch (error) {
      alert('Fehler beim Abrufen der Wahldaten.');
    }
  };

  const handleCloseVotingModal = () => {
    setShowVotingModal(false);
    setFormSchema(null);
    setSelectedElection(null);
  };

  const handleFormSubmit = (submittedData: any) => {
    console.log('Abgestimmte Daten:', submittedData);
    alert('Vielen Dank für Ihre Stimme!');
    handleCloseVotingModal();
  };

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
          filteredElections.map((election) => {
            // Sicherstellen, dass die Daten existieren
            const startDate = election.start_date ? new Date(election.start_date) : null;
            const endDate = election.end_date ? new Date(election.end_date) : null;
            const now = new Date();

            // Status bestimmen
            const isPlanned = startDate ? startDate > now : false; 
            const isEnded = endDate ? endDate < now : false;
            const isOngoing = !isPlanned && !isEnded;

            return (
              <Col md={4} className="mb-4" key={election.election_id}>
                <Card className="shadow-sm position-relative">
                  <Card.Body>
                    <Card.Title>{election.name}</Card.Title>
                    <Card.Text>{election.description || 'Keine Beschreibung verfügbar.'}</Card.Text>

                    <Card.Text className="text-muted">
                      Status: {isPlanned ? 'Geplant' : isEnded ? 'Beendet' : 'Laufend'}
                    </Card.Text>

                    {/* Falls die Wahl beendet ist, zeige eine grüne Meldung an */}
                    {isEnded && (
                      <p className="text-success">
                        <strong>✔ Ergebnisse stehen zur Ansicht bereit</strong>
                      </p>
                    )}

                    <div className="d-flex justify-content-between">
                      <Button variant="secondary" onClick={() => handleShowDetailsModal(election)}>
                        Details 
                      </Button>
                      <Button 
                        variant={isOngoing ? 'primary' : 'secondary'}
                        onClick={() => handleJoinElection(election)}
                        disabled={!isOngoing}
                      >
                        Abstimmen
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col>
            <p className="text-muted">Keine Wahlen gefunden.</p>
          </Col>
        )}
      </Row>


      {/* Modal für Wahldetails */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedElection?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedElection?.description}</p>
          <p><strong>Status:</strong> {selectedElection?.status}</p>
          <p><strong>Startdatum:</strong> {selectedElection?.start_date ? new Intl.DateTimeFormat('de-DE').format(new Date(selectedElection.start_date)) : 'Unbekannt'}</p>
          <p><strong>Enddatum:</strong> {selectedElection?.end_date ? new Intl.DateTimeFormat('de-DE').format(new Date(selectedElection.end_date)) : 'Unbekannt'}</p>
          <hr />
          <h5>Ergebnisse:</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Schließen
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showVotingModal} onHide={handleCloseVotingModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Abstimmen: {selectedElection?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formSchema ? (
            <ReactFormGenerator
              data={formSchema}
              onSubmit={handleFormSubmit}
              action_name="Abstimmen"
              form_action=""
              form_method="POST"
            />
          ) : (
            <p>Formulardaten werden geladen...</p>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={handleCloseVotingModal} style={{ alignSelf: 'flex-start' }}>
            Abbrechen
          </Button>
          <Button variant="primary" onClick={() => {
            const form = document.querySelector('form');
            form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }}>
            Abstimmen
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StartPage;
