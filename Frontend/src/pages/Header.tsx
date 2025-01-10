import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  // Logout-Funktion
  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/login'); 
  };

  return (
    <Navbar 
      bg="light" 
      expand="lg" 
      className="mb-4"
      style={{ borderBottom: '1px solid var(--primary-color)'}}
    >
      <Container>
        <Navbar.Brand 
          onClick={() => navigate('/home')} 
          style={{ cursor: 'pointer', color: 'var(--primary-color)', fontSize: '20px', fontWeight: '400'}}>
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
