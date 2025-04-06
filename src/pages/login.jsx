import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import '../styles/Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { setUser } = useContext(AuthContext);

  // Validación de correo electrónico
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('El correo electrónico es obligatorio');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  // Validación de contraseña
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      return false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const handleLogin = async () => {
    // Validar ambos campos antes de intentar el inicio de sesión
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return; // Detener el proceso si alguna validación falla
    }

    try {
      const response = await fetch('http://tk4gscwgcoc0s08c00gskg8o.31.170.165.191.sslip.io/club/usuarios/');
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
              className={`form-input ${emailError ? 'input-error' : ''}`}
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-input ${passwordError ? 'input-error' : ''}`}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
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