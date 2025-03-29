import React, { useState, useEffect } from 'react'; 
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  Modal,
  Alert
} from 'react-native';
import API_URL from '../url';

const Bloques = ({ navigation }) => {
  const [mesas, setMesas] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBlockMesas, setSelectedBlockMesas] = useState([]);

  // Variable de IP 
  const IP = API_URL;

  // Función para agrupar un array en subarrays de tamaño "chunkSize"
  const chunkArray = (arr, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  useEffect(() => {
    // Obtener mesas y bloques de la API
    const fetchData = async () => {
      try {
        const [mesasResponse, bloquesResponse] = await Promise.all([
          fetch(`http://${IP}/club/mesas/`),
          fetch(`http://${IP}/club/bloques/`)
        ]);
        const mesasData = await mesasResponse.json();
        const bloquesData = await bloquesResponse.json();
        setMesas(mesasData);
        setBloques(bloquesData);
      } catch (error) {
        console.error("Error al obtener mesas o bloques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función de navegación que pasa el objeto seleccionado (mesa)
  const navigateToMenu = (selected) => {
    navigation.navigate('Menu', { mesa: selected });
  };

  // Función para abrir el modal con las mesas del bloque seleccionado
  const openBlockModal = (bloque) => {
    if (bloque.mesas && Array.isArray(bloque.mesas) && bloque.mesas.length > 0) {
      setSelectedBlockMesas(bloque.mesas);
      setModalVisible(true);
    } else {
      Alert.alert("No hay mesas", "Este bloque no tiene mesas asignadas.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#259588" />
      </View>
    );
  }

  const chunkedMesas = chunkArray(mesas, 3);
  const chunkedBloques = chunkArray(bloques, 3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Selecciona una mesa o bloque para tomar la orden</Text>

      <Text style={styles.sectionTitle}>Mesas</Text>
      {chunkedMesas.map((row, rowIndex) => (
        <View key={`mesa-row-${rowIndex}`} style={styles.rowContainer}>
          {row.map(mesa => (
            <TouchableOpacity
              key={mesa.id}
              style={[styles.button, styles.greenButton]}
              onPress={() => navigateToMenu({ id: mesa.id, display: `M${mesa.id}` })}
            >
              <Text style={styles.buttonText}>M{mesa.id}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Bloques</Text>
      {chunkedBloques.map((row, rowIndex) => (
        <View key={`bloque-row-${rowIndex}`} style={styles.rowContainer}>
          {row.map(bloque => (
            <TouchableOpacity
              key={bloque.id}
              style={[styles.button, styles.redButton]}
              onPress={() => openBlockModal(bloque)}
            >
              <Text style={styles.buttonText}>B{bloque.id}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Modal para mostrar las mesas asociadas al bloque */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecciona una Mesa</Text>
            {selectedBlockMesas.map((mesaId, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, styles.greenButton, styles.modalButton]}
                onPress={() => {
                  setModalVisible(false);
                  navigateToMenu({ id: mesaId, display: `M${mesaId}` });
                }}
              >
                <Text style={styles.buttonText}>M{mesaId}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FAF9F6',
    padding: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    width: 80,
    height: 50,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenButton: {
    backgroundColor: '#259588',
  },
  redButton: {
    backgroundColor: '#ff1d65',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    marginVertical: 5,
  },
  modalCancelButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ccc',
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Bloques;
