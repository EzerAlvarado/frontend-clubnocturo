// src/components/Drawer.jsx
import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Nav } from 'react-bootstrap';
import '../styles/drawer.css'; // Importa los estilos CSS

const Drawer = () => {
  const { setUser } = useContext(AuthContext);

  return (
    <div className="drawer">
      <Nav className="flex-column">
        <Nav.Link href="/">Inicio</Nav.Link>
        <Nav.Link href="/users">Usuarios</Nav.Link>
        <Nav.Link href="/agenda">Agenda</Nav.Link>
        <Nav.Link
          onClick={() => {
            setUser(null); // Cerrar sesión
          }}
        >
          Cerrar sesión
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Drawer;