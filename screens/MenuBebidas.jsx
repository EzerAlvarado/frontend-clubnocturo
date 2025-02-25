import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const MenuBebidas = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Parámetros estáticos
  const mesaId = 1; // ID de la mesa (estático)
  const usuarioResponsableId = 1; // ID del usuario responsable (estático)

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada) {
      setProductosFiltrados(productos.filter(p => p.categoria === categoriaSeleccionada));
    } else {
      setProductosFiltrados(productos);
    }
  }, [categoriaSeleccionada, productos]);

  // Función para obtener los productos usando fetch
  const fetchProductos = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/club/productos/");
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener los Productos:", error);
    }
  };

  const increment = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrement = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  const agregarProducto = (producto) => {
    if (quantities[producto.id] > 0) {
      setProductosSeleccionados(prev => {
        const index = prev.findIndex(p => p.id === producto.id);
        if (index !== -1) {
          const nuevosProductos = [...prev];
          nuevosProductos[index].cantidad += quantities[producto.id];
          return nuevosProductos;
        }
        return [...prev, { ...producto, cantidad: quantities[producto.id] }];
      });
      setQuantities(prev => ({
        ...prev,
        [producto.id]: 0,
      }));
    }
  };

  const modificarCantidad = (id, nuevaCantidad) => {
    setProductosSeleccionados(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index !== -1) {
        if (nuevaCantidad <= 0) {
          return prev.filter(p => p.id !== id);
        } else {
          const nuevosProductos = [...prev];
          nuevosProductos[index].cantidad = nuevaCantidad;
          return nuevosProductos;
        }
      }
      return prev;
    });
  };

  const confirmarOrden = async () => {
    try {
      const fechaDeOrden = new Date().toISOString().split('T')[0];

      // Crear órdenes de compra
      for (const producto of productosSeleccionados) {
        const response = await fetch("http://127.0.0.1:8000/club/ordenes-de-compra/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cantidad: producto.cantidad,
            fecha_de_orden: fechaDeOrden,
            mesas: mesaId, // Usar mesaId estático
            producto: producto.id,
            usuario_responsable: usuarioResponsableId, // Usar usuarioResponsableId estático
            precio_orden: producto.cantidad * producto.precio,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al confirmar la orden para el producto ${producto.id}: ${errorText}`);
        }
      }

      // Calcular el total de la orden actual
      const totalOrdenActual = productosSeleccionados.reduce(
        (total, producto) => total + producto.cantidad * producto.precio,
        0
      );

      // Asegurarse de que el total tenga exactamente 2 decimales
      const totalCobro = parseFloat(totalOrdenActual.toFixed(2));

      // Verificar si existe un registro de Cargo para la mesa
      const getCargoResponse = await fetch(`http://127.0.0.1:8000/club/cargos/?mesa=${mesaId}`);
      const cargosData = await getCargoResponse.json();

      if (cargosData.length === 0) {
        // Si no existe, crear un nuevo registro de Cargo
        const postCargoResponse = await fetch("http://127.0.0.1:8000/club/cargos/", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mesa: mesaId, // Usar el nombre de campo correcto
            total_cobro: totalCobro, // Usar el total redondeado a 2 decimales
            estado: 'pendiente', // Usar un valor válido para estado
            usuario_responsable: usuarioResponsableId, // Usar el nombre de campo correcto
          }),
        });

        if (!postCargoResponse.ok) {
          const errorText = await postCargoResponse.text();
          throw new Error(`Error al crear el registro de Cargo: ${errorText}`);
        }
      } else {
        // Si existe, actualizar el registro de Cargo
        const cargoExistente = cargosData[0]; // Tomar el primer registro (debería ser el único)

        // Convertir cargoExistente.total_cobro a número
        const totalCobroExistente = parseFloat(cargoExistente.total_cobro);

        // Calcular el nuevo total y redondearlo a 2 decimales
        const nuevoTotalCobro = parseFloat((totalCobroExistente + totalCobro).toFixed(2));

        const putResponse = await fetch(`http://127.0.0.1:8000/club/cargos/${cargoExistente.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mesa: mesaId, // Usar el nombre de campo correcto
            total_cobro: nuevoTotalCobro, // Usar el total redondeado a 2 decimales
            estado: 'pendiente', // Usar un valor válido para estado
            usuario_responsable: usuarioResponsableId, // Usar el nombre de campo correcto
          }),
        });

        if (!putResponse.ok) {
          const errorText = await putResponse.text();
          throw new Error(`Error al actualizar el ticket: ${errorText}`);
        }
      }

      setProductosSeleccionados([]);
      setQuantities({});
      Alert.alert("Éxito", "Orden confirmada con éxito");
    } catch (error) {
      console.error("Error al confirmar la orden:", error);
      Alert.alert("Error", error.message);
    }
  };

  const cancelarOrden = () => {
    setProductosSeleccionados([]);
    setQuantities({});
    Alert.alert("Orden cancelada");
  };

  // Función para manejar la navegación al módulo TicketScreen
  const verTicket = () => {
    navigation.navigate('Ticket', { mesaId: mesaId }); // Usar mesaId directamente
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>

        <Text style={[styles.title, styles.titleAligned]}>Menú de Bebidas</Text>

        <Picker
          selectedValue={categoriaSeleccionada}
          onValueChange={(itemValue) => setCategoriaSeleccionada(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Todas" value="" />
          <Picker.Item label="Botellas" value="Botellas" />
          <Picker.Item label="Bebidas Preparadas" value="Bebidas preparadas" />
          <Picker.Item label="Jugos y refrescos" value="Jugos y refrescos" />
          <Picker.Item label="Agua" value="Agua" />
        </Picker>

        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>{item.nombre_producto} - ${item.precio}</Text>
              <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlButton} onPress={() => decrement(item.id)}>
                  <Text style={styles.controlButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantities[item.id] || 0}</Text>
                <TouchableOpacity style={styles.controlButton} onPress={() => increment(item.id)}>
                  <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={() => agregarProducto(item)}>
                  <Text style={styles.addButtonText}>Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 5 }}
          style={{ maxHeight: 300 }}
          scrollEnabled={true}
        />

        <Text style={styles.sectionTitle}>Productos Seleccionados</Text>
        <FlatList
          data={productosSeleccionados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>{item.nombre_producto} x{item.cantidad} - ${item.cantidad * item.precio}</Text>
              <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlButton} onPress={() => modificarCantidad(item.id, item.cantidad - 1)}>
                  <Text style={styles.controlButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.cantidad}</Text>
                <TouchableOpacity style={styles.controlButton} onPress={() => modificarCantidad(item.id, item.cantidad + 1)}>
                  <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          scrollEnabled={false}
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={confirmarOrden}>
            <Text style={styles.footerButtonText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={cancelarOrden}>
            <Text style={styles.footerButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={verTicket}>
            <Text style={styles.footerButtonText}>Ver Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    padding: 16,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#259588',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  titleAligned: {
    textAlign: 'left',
  },
  picker: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
    marginVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#259588',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  controlButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#FFA500',
    padding: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  selectedItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 40,
  },
  footerButton: {
    backgroundColor: '#259588',
    padding: 15,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MenuBebidas; // Exportación correcta al final del archivo