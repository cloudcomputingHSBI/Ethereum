import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Image } from 'react-bootstrap';
import AusweisImage from '../../assets/Ausweis.png';
import { registerUser } from '../../api/authService'; // Importiere die API-Methode

const RegisterMRZ: React.FC = () => {
  const [block1, setBlock1] = useState<string>('');
  const [block2, setBlock2] = useState<string>('');
  const [block3, setBlock3] = useState<string>('');
  const [block4, setBlock4] = useState<string>('');
  const [block5, setBlock5] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!block1 || !block2 || !block3 || !block4 || !block5) {
      setErrorMessage('Bitte fülle alle MRZ-Blöcke aus');
      return;
    }

    try {
      // Daten aus localStorage abrufen
      const generalData = JSON.parse(localStorage.getItem('generalData') || '{}');
      const completeData = { ...generalData, mrzData: { block1, block2, block3, block4, block5 } };

      // API-Aufruf
      await registerUser(completeData);

      // Erfolgreiche Registrierung: Weiterleitung zum Login
      navigate('/login');
    } catch (error: any) {
      // Fehler vom Server anzeigen
      setErrorMessage(error.response?.data?.message || 'Fehler bei der Registrierung');
    }
  };

  return (
    <Container fluid className="py-5">
      <Row className="d-flex justify-content-center align-items-center">
        <Col xs={12} md={6} lg={5}>
          <Card className="shadow-lg p-4 bg-light" style={{ borderRadius: '10px' }}>
            <Card.Body>
              <h3 className="text-center mb-4">Registrieren - Ausweisdaten</h3>
              <p className="text-muted text-center">
                Um deinen Account zu verifizieren, benötigen wir die MRZ-Daten von deinem Ausweis.
              </p>
              <Image src={AusweisImage} alt="Erklärung der MRZ-Blöcke" fluid className="mb-4" style={{ maxWidth: '450px' }} />

              <Form onSubmit={handleRegister}>
                <Form.Group controlId="formMRZBlock1" className="mb-3">
                  <Form.Label>Block 1</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="L01X00T471<<<<<<<<<<<<<<"
                    required
                    value={block1}
                    onChange={(e) => setBlock1(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formMRZBlock2" className="mb-3">
                  <Form.Label>Block 2</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="8308126"
                    required
                    value={block2}
                    onChange={(e) => setBlock2(e.target.value)}
                  />
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group controlId="formMRZBlock3" className="mb-3">
                      <Form.Label>Block 3</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="3108011"
                        required
                        value={block3}
                        onChange={(e) => setBlock3(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="formMRZBlock4" className="mb-3">
                      <Form.Label>Block 4</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="2108"
                        required
                        value={block4}
                        onChange={(e) => setBlock4(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={4}>
                    <Form.Group controlId="formMRZBlock5" className="mb-3">
                      <Form.Label>Block 5</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="7"
                        required
                        value={block5}
                        onChange={(e) => setBlock5(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                <Button type="submit" variant="primary" className="w-100">
                  Registrieren
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterMRZ;
