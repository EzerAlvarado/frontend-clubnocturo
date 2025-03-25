// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Drawer from './components/Drawer';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Agenda from './pages/Agenda';
import Login from './pages/login';
import { AuthContext } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Container fluid className="p-0 m-0">
        {user ? (
          <Row>
            <Col xs={12} md={2} className="drawer-col">
              <Drawer />
            </Col>
            <Col xs={12} md={10}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Col>
          </Row>
        ) : (
          <div className="login-full-screen">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        )}
      </Container>
    </Router>
  );
}

export default App;