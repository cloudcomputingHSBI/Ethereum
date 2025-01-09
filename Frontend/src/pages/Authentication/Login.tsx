import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { loginUser } from '../../api/authService'; // Importiere die Login-API-Methode

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // API-Aufruf zur Authentifizierung
      const response = await loginUser({ email, password });

      // Speichere das JWT im localStorage
      localStorage.setItem('jwtToken', response.token);

      // Weiterleitung nach erfolgreichem Login
      navigate('/home');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Fehler beim Login.');
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Card.Body>
          <h2>Login</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email-Adresse</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email eingeben"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Passwort</Form.Label>
              <Form.Control
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

            <Button type="submit" className="login-button">
              Login
            </Button>

            <Button
              onClick={() => navigate('/register')}
              className="register-button"
            >
              Noch kein Konto? Registrieren
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;
