import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import '../styles/Login.css'; // Importa los estilos CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);

  const IP = '127.0.0.1';

  const handleLogin = async () => {
    try {
      const response = await fetch(`http://${IP}:8000/club/usuarios/`);
      const usuarios = await response.json();

      const usuarioEncontrado = usuarios.find(
        (usuario) =>
          usuario.correo_cliente.toLowerCase() === email.toLowerCase() &&
          usuario.contrasena.toString() === password
      );

      if (usuarioEncontrado) {
        setUser(usuarioEncontrado);
      } else {
        alert('Error: Credenciales inválidas');
      }
    } catch (error) {
      console.error(error);
      alert('Error: No se pudo conectar al servidor');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">

          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-button" onClick={handleLogin}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;