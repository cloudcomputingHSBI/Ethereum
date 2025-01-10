import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  // Beispiel: Benutzername aus localStorage laden
  const userName = localStorage.getItem('userName') || 'Gast';

  // Logout-Funktion
  const handleLogout = () => {
    localStorage.removeItem('jwtToken'); // Entferne JWT-Token
    navigate('/login'); // Weiterleitung zur Login-Seite
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          Blockchain Wahlsystem
        </Navbar.Brand>
        <Nav className="ml-auto">
          <Nav.Link onClick={() => navigate('/settings')}>Einstellungen</Nav.Link>
          <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
