import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const RegisterGeneral: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Passwörter stimmen nicht überein');
      return;
    }

    // Speichern der Daten in localStorage oder Context
    const generalData = { firstName, lastName, email, password };
    localStorage.setItem('generalData', JSON.stringify(generalData));

    // Navigieren zur zweiten Seite
    navigate('/register-mrz');
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <Row className="w-100">
        <Col xs={12} md={6} lg={5} className="mx-auto">
          <Card className="shadow-lg p-4 bg-light" style={{ borderRadius: '10px' }}>
            <Card.Body>
              <h3 className="text-center mb-4">Registrieren - Allgemeine Daten</h3>
              <Form onSubmit={handleNextStep}>
                <Row className="mb-3">
                  <Col>
                    <Form.Group controlId="formFirstName">
                      <Form.Label>Vorname</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Vorname eingeben"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="formLastName">
                      <Form.Label>Nachname</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nachname eingeben"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>Email-Adresse</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email eingeben"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Label>Passwort</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Passwort eingeben"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="formConfirmPassword" className="mb-3">
                  <Form.Label>Passwort bestätigen</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Passwort bestätigen"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                <Button type="submit" variant="primary" className="w-100">
                  Weiter
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterGeneral;
