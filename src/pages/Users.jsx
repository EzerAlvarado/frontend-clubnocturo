import React, { useState, useEffect } from 'react';
import { Container, Button, Table } from 'react-bootstrap';
import UserModal from '../components/UserModal';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import '../styles/users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Obtener los usuarios al cargar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para obtener los usuarios
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      // Filtrar usuarios que no estén eliminados
      const filteredUsers = data.filter(user => !user.eliminado);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (userData) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, userData);
      } else {
        await createUser(userData);
      }
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
    }
  };

  // Función para manejar la eliminación de un usuario
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      fetchUsers(); // Recargar la lista de usuarios
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
    }
  };

  // Función para manejar la edición de un usuario
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  return (
    <Container fluid className="users-container">
      <h1>Gestión de Usuarios</h1>
      <Button onClick={() => { setSelectedUser(null); setShowModal(true); }}>
        Agregar Usuario
      </Button>

      {/* Tabla de usuarios */}
      <div className="table-responsive">
        <Table striped bordered hover className="user-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Número de Celular</th>
              <th>Correo del Cliente</th>
              <th>Contraseña</th>
              <th>Acciones</th>
              
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.nombre}</td>
                <td>{user.estado_solicitud}</td>
                <td>{user.numero_de_celular}</td>
                <td>{user.correo_cliente}</td>
                <td>{user.contrasena}</td>
                <td>
                  <Button variant="warning" onClick={() => handleEdit(user)}>
                    Editar
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleDelete(user.id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal para agregar/editar usuario */}
      <UserModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        user={selectedUser}
        handleSubmit={handleSubmit}
      />
    </Container>
  );
}

export default Users;