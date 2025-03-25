import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import '../styles/userModal.css';

function UserModal({ show, handleClose, user, handleSubmit }) {
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    estado_solicitud: '',
    numero_de_celular: '',
    correo_cliente: '',
    contrasena: '',
    confirmar_contrasena: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Efecto para actualizar los estados cuando el usuario cambia
  useEffect(() => {
    if (user) {
      // Si hay un usuario, establecer los valores del formulario
      setFormData({
        nombre: user.nombre || '',
        estado_solicitud: user.estado_solicitud || '',
        numero_de_celular: user.numero_de_celular || '',
        correo_cliente: user.correo_cliente || '',
        contrasena: user.contrasena || '',
        confirmar_contrasena: user.contrasena || ''
      });
    } else {
      // Si no hay usuario (agregar nuevo), reiniciar los valores
      setFormData({
        nombre: '',
        estado_solicitud: '',
        numero_de_celular: '',
        correo_cliente: '',
        contrasena: '',
        confirmar_contrasena: ''
      });
    }
    // Reiniciar errores y campos tocados al abrir/cerrar modal
    setErrors({});
    setTouched({});
  }, [user, show]);

  // Función para manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validación en tiempo real
    validateField(name, value);
  };

  // Función para marcar campo como tocado
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, formData[name]);
  };

  // Validación de campo individual
  const validateField = (name, value) => {
    let newErrors = { ...errors };
    
    switch (name) {
      case 'nombre':
        // Check if value is a string before using trim()
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.nombre = 'El nombre es requerido';
        } else {
          delete newErrors.nombre;
        }
        break;
      case 'estado_solicitud':
        if (!value) {
          newErrors.estado_solicitud = 'Seleccione un rol';
        } else {
          delete newErrors.estado_solicitud;
        }
        break;
      case 'numero_de_celular':
        // Check if value is a string before using trim()
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.numero_de_celular = 'El número es requerido';
        } else if (typeof value === 'string' && !/^\d{10}$/.test(value)) {
          newErrors.numero_de_celular = 'Ingrese un número válido de 10 dígitos';
        } else {
          delete newErrors.numero_de_celular;
        }
        break;
      case 'correo_cliente':
        // Check if value is a string before using trim()
        if (!value || (typeof value === 'string' && !value.trim())) {
          newErrors.correo_cliente = 'El correo es requerido';
        } else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.correo_cliente = 'Ingrese un correo válido';
        } else {
          delete newErrors.correo_cliente;
        }
        break;
      case 'contrasena':
        if (!value) {
          newErrors.contrasena = 'La contraseña es requerida';
        } else if (typeof value === 'string' && value.length < 6) {
          newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
        } else {
          delete newErrors.contrasena;
        }
        
        // Validar también confirmar_contrasena si ya tiene valor
        if (formData.confirmar_contrasena && value !== formData.confirmar_contrasena) {
          newErrors.confirmar_contrasena = 'Las contraseñas no coinciden';
        } else if (formData.confirmar_contrasena) {
          delete newErrors.confirmar_contrasena;
        }
        break;
      case 'confirmar_contrasena':
        if (!value) {
          newErrors.confirmar_contrasena = 'Confirme la contraseña';
        } else if (value !== formData.contrasena) {
          newErrors.confirmar_contrasena = 'Las contraseñas no coinciden';
        } else {
          delete newErrors.confirmar_contrasena;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para manejar el envío del formulario
  const onSubmit = (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched = Object.keys(formData).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {});
    setTouched(allTouched);
    
    // Validar todos los campos
    let formIsValid = true;
    Object.keys(formData).forEach(field => {
      if (field !== 'confirmar_contrasena') { // No enviar este campo al backend
        const fieldIsValid = validateField(field, formData[field]);
        formIsValid = formIsValid && fieldIsValid;
      }
    });
    
    if (formIsValid) {
      // Crear el objeto con los datos del usuario
      const userData = {
        id: user ? user.id : Date.now(),
        estado_solicitud: formData.estado_solicitud,
        nombre: formData.nombre,
        numero_de_celular: formData.numero_de_celular,
        correo_cliente: formData.correo_cliente,
        contrasena: formData.contrasena,
      };

      handleSubmit(userData);
      handleClose();
    }
  };

  // Helper para determinar si mostrar error
  const showError = (field) => touched[field] && errors[field];

  return (
    <Modal show={show} onHide={handleClose} centered className="user-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="user-icon"></i>
          {user ? 'Editar Usuario' : 'Agregar Usuario'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit} noValidate>
          <div className="form-section">
            <h5 className="section-title">Información Personal</h5>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={showError('nombre')}
                    placeholder="Ingrese nombre completo"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombre}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rol de Usuario</Form.Label>
                  <Form.Select
                    name="estado_solicitud"
                    value={formData.estado_solicitud}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={showError('estado_solicitud')}
                  >
                    <option value="">Seleccione un Rol</option>
                    <option value="M">Mesero</option>
                    <option value="C">Caja</option>
                    <option value="B">Bartender</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.estado_solicitud}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Celular</Form.Label>
                  <Form.Control
                    type="tel"
                    name="numero_de_celular"
                    value={formData.numero_de_celular}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={showError('numero_de_celular')}
                    placeholder="Ej: 3001234567"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.numero_de_celular}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="form-section">
            <h5 className="section-title">Información de Cuenta</h5>
            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                name="correo_cliente"
                value={formData.correo_cliente}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={showError('correo_cliente')}
                placeholder="ejemplo@correo.com"
              />
              <Form.Control.Feedback type="invalid">
                {errors.correo_cliente}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={showError('contrasena')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.contrasena}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmar_contrasena"
                    value={formData.confirmar_contrasena}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={showError('confirmar_contrasena')}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmar_contrasena}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {user ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default UserModal;