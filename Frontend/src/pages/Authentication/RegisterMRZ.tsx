import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Image } from 'react-bootstrap';
import AusweisImage from '../../assets/Ausweis.png';
import { registerUser } from '../../api/authService';
import { ethers } from 'ethers';

const RegisterMRZ: React.FC = () => {
  const [block1, setBlock1] = useState<string>('');
  const [block2, setBlock2] = useState<string>('');
  const [block3, setBlock3] = useState<string>('');
  const [block4, setBlock4] = useState<string>('');
  const [block5, setBlock5] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [showLoginButton, setShowLoginButton] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!block1 || !block2 || !block3 || !block4 || !block5) {
      setErrorMessage('Bitte fülle alle MRZ-Blöcke aus');
      return;
    }

    try {
      // 1️⃣ Wallet im Frontend generieren
      const wallet = ethers.Wallet.createRandom();
      const publicKey = wallet.address;
      const generatedPrivateKey = wallet.privateKey;

      // 2️⃣ Private Key nur im State speichern (nicht in localStorage!)
      setPrivateKey(generatedPrivateKey);

      // 3️⃣ Daten für das Backend vorbereiten
      const generalData = JSON.parse(localStorage.getItem('generalData') || '{}');
      const completeData = { 
        ...generalData, 
        mrzData: { block1, block2, block3, block4, block5 },
        publicKey // Public Key wird mitgeschickt!
      };

      // 4️⃣ API-Aufruf mit Public Key
      const response = await registerUser(completeData);

      if (response && response.walletAddress) {
        alert("✅ Registrierung erfolgreich! Speichere deinen Private Key sicher!");
      }

    } catch (error: any) {
      setErrorMessage(error.message || 'Fehler bei der Registrierung');
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

              {/* Private Key nur einmal anzeigen, dann nie wieder */}
              {privateKey && !showLoginButton && (
                <div className="mt-4 p-3 border border-info rounded">
                  <h5>Dein privater Schlüssel</h5>
                  <p className="text-break">{privateKey}</p>
                  <p className="text-danger">
                    🚨 Speichere diesen Schlüssel sicher! Er kann nicht wiederhergestellt werden! 🚨
                  </p>
                  <Button variant="danger" className="mt-2" onClick={() => { 
                    setPrivateKey(null); 
                    setShowLoginButton(true); // Zeigt den Login-Button an
                  }}>
                    Verstanden, Schlüssel gespeichert
                  </Button>
                </div>
              )}

              {/* Login-Button erscheint erst, wenn der Nutzer bestätigt hat */}
              {showLoginButton && (
                <Button 
                  variant="success" 
                  className="mt-3 w-100" 
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterMRZ;
