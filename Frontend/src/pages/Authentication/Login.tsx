import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();

  interface LoginCredentials {
    email: string;
    password: string;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const credentials: LoginCredentials = { email, password };

      // API-Aufruf für Login
      // await loginUser(credentials);

      // Weiterleitung nach erfolgreichem Login
      navigate('/home');
    } catch (error) {
      console.error(error);
      setErrorMessage('Fehler beim Login.');
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
