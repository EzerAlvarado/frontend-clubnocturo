import axios from 'axios';

const API_URL = 'http://tk4gscwgcoc0s08c00gskg8o.31.170.165.191.sslip.io/club/usuarios'; // Elimina la barra final

export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    console.log('Respuesta del backend (getUsers):', response.data); // Depuración
    return response.data;
  } catch (error) {
    console.error('Error en getUsers:', error); // Depuración
    throw error;
  }
};

export const createUser = async (user) => {
  try {
    console.log('Datos enviados al backend:', user); // Depuración
    const response = await axios.post(`${API_URL}/`, user);
    console.log('Respuesta del backend (createUser):', response.data); // Depuración
    return response.data;
  } catch (error) {
    console.error('Error en createUser:', error); // Depuración
    console.log('Respuesta del servidor:', error.response); // Depuración
    throw error;
  }
};

export const updateUser = async (id, user) => {
  try {
    console.log('Actualizando usuario con ID:', id); // Depuración
    const response = await axios.put(`${API_URL}/${id}/`, user);
    console.log('Respuesta del backend (updateUser):', response.data); // Depuración
    return response.data;
  } catch (error) {
    console.error('Error en updateUser:', error); // Depuración
    console.log('Respuesta del servidor:', error.response); // Depuración
    throw error;
  }
};

// userService.js
export const deleteUser = async (id) => {
  try {
    console.log('Marcando usuario como eliminado con ID:', id); // Depuración
    const response = await axios.patch(`${API_URL}/${id}/`, { eliminado: true });
    console.log('Respuesta del backend (deleteUser):', response.data); // Depuración
    return response.data;
  } catch (error) {
    console.error('Error en deleteUser:', error); // Depuración
    console.log('Respuesta del servidor:', error.response); // Depuración
    throw error;
  }
};