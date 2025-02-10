import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Switch,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';


const EditarEvento = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { event } = route.params; // Recibimos el evento a editar

  // Inicializamos los estados con los datos del evento
  const [fechaInicio, setFechaInicio] = React.useState(new Date(event.fecha_inicio_de_evento));
  const [fechaFin, setFechaFin] = React.useState(new Date(event.fecha_final_de_evento));

  const [showFechaInicioDatePicker, setShowFechaInicioDatePicker] = React.useState(false);
  const [showFechaInicioTimePicker, setShowFechaInicioTimePicker] = React.useState(false);
  const [showFechaFinDatePicker, setShowFechaFinDatePicker] = React.useState(false);
  const [showFechaFinTimePicker, setShowFechaFinTimePicker] = React.useState(false);

  const [pago, setPago] = React.useState(event.pago_renta);
  const [nombre, setNombre] = React.useState(event.observaciones);
  // Asumimos que "bloque" es un arreglo; usamos el primer elemento
  const [numero, setNumero] = React.useState(event.bloque[0] ? event.bloque[0].toString() : '');

  // Estado para almacenar los bloques obtenidos de la API
  const [bloques, setBloques] = React.useState([]);
  // Efecto para obtener los bloques desde la API
    React.useEffect(() => {
      fetch('http://192.168.100.7:8000/club/bloques/')
        .then((response) => response.json())
        .then((data) => setBloques(data))
        .catch((error) => console.error('Error al obtener bloques:', error));
    }, []);


  // Handlers para Fecha Inicio
  const onChangeFechaInicioDate = (e, selectedDate) => {
    setShowFechaInicioDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const updatedDate = new Date(fechaInicio);
      updatedDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setFechaInicio(updatedDate);
    }
  };

  const onChangeFechaInicioTime = (e, selectedDate) => {
    setShowFechaInicioTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const updatedDate = new Date(fechaInicio);
      updatedDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setFechaInicio(updatedDate);
    }
  };

  // Handlers para Fecha Finalización
  const onChangeFechaFinDate = (e, selectedDate) => {
    setShowFechaFinDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const updatedDate = new Date(fechaFin);
      updatedDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setFechaFin(updatedDate);
    }
  };

  const onChangeFechaFinTime = (e, selectedDate) => {
    setShowFechaFinTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const updatedDate = new Date(fechaFin);
      updatedDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setFechaFin(updatedDate);
    }
  };

  // Función para actualizar el evento
  const handleActualizar = async () => {
    // Validaciones
    if (!nombre.trim() || !numero.trim()) {
      alert("Error: Por favor, complete los campos requeridos: Nombre y Número.");
      return;
    }
    if (fechaInicio > fechaFin) {
      alert("Error: La fecha de inicio no puede ser posterior a la fecha final.");
      return;
    }

    const payload = {
      pago_renta: pago,
      fecha_inicio_de_evento: fechaInicio.toISOString(),
      fecha_final_de_evento: fechaFin.toISOString(),
      observaciones: nombre,
      bloque: [parseInt(numero, 10)],
      cliente_rentador: 1,
    };

    try {
      // Usamos el método PUT para actualizar el evento
      const response = await fetch(`http://192.168.100.7:8000/club/eventos/${event.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al actualizar:', errorData);
        alert("Error: No se pudo actualizar el evento. Verifique los datos e inténtelo de nuevo.");
      } else {
        const data = await response.json();
        console.log('Evento actualizado:', data);
        alert("Éxito: Evento actualizado correctamente.");
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al conectar:', error);
      alert("Error: Error al conectar con el servidor.");
    }
    navigation.navigate('Agenda Eventos')
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS==='ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Editar Evento</Text>
          <View style={styles.formulario}>
            {/* Fecha Inicio */}
            <Text style={styles.inputLabel}>Fecha Inicio</Text>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setShowFechaInicioDatePicker(true)}
                style={[styles.inputDesign, styles.halfInput]}
              >
                <Text style={styles.fecha}>{fechaInicio.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFechaInicioTimePicker(true)}
                style={[styles.inputDesign, styles.halfInput]}
              >
                <Text style={styles.fecha}>
                  {fechaInicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
            {showFechaInicioDatePicker && (
              <DateTimePicker
                value={fechaInicio}
                mode="date"
                display="default"
                onChange={onChangeFechaInicioDate}
              />
            )}
            {showFechaInicioTimePicker && (
              <DateTimePicker
                value={fechaInicio}
                mode="time"
                display="default"
                onChange={onChangeFechaInicioTime}
              />
            )}

            {/* Fecha Finalización */}
            <Text style={styles.inputLabel}>Fecha Finalización</Text>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setShowFechaFinDatePicker(true)}
                style={[styles.inputDesign, styles.halfInput]}
              >
                <Text style={styles.fecha}>{fechaFin.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFechaFinTimePicker(true)}
                style={[styles.inputDesign, styles.halfInput]}
              >
                <Text style={styles.fecha}>
                  {fechaFin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
            {showFechaFinDatePicker && (
              <DateTimePicker
                value={fechaFin}
                mode="date"
                display="default"
                onChange={onChangeFechaFinDate}
              />
            )}
            {showFechaFinTimePicker && (
              <DateTimePicker
                value={fechaFin}
                mode="time"
                display="default"
                onChange={onChangeFechaFinTime}
              />
            )}

            {/* Input de observaciones (Nombre) */}
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput
              style={styles.inputDesign}
              placeholder="Ingrese el nombre del evento"
              maxLength={150}
              value={nombre}
              onChangeText={setNombre}
            />

          {/* Input de bloque (Número) con lista desplegable */}
          <Text style={styles.inputLabel}>Número</Text>
          <View style={styles.inputDesign}>
            <Picker
              selectedValue={numero}
              onValueChange={(itemValue) => setNumero(itemValue)}
            >
              <Picker.Item label="Seleccione un bloque" value="" />
              {bloques.map((bloque) => (
                <Picker.Item
                  key={bloque.id}
                  label={bloque.descripcion}
                  value={bloque.id.toString()}
                />
              ))}
            </Picker>
          </View>

            {/* Switch para Estado de pago */}
            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>Estado de pago:</Text>
              <Switch
                value={pago}
                onValueChange={setPago}
                thumbColor={pago ? "#259588" : "#e1e1e1"}
              />
              <Text style={styles.switchLabel}>{pago ? "Pagado" : "Pendiente"}</Text>
            </View>
          </View>

          <View style={styles.botonArea}>
            <TouchableOpacity style={styles.btnGreen} onPress={handleActualizar}>
              <Text style={styles.btnText}>Actualizar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.navigate('Agenda Eventos')}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    flexGrow: 1,
    backgroundColor: "#fffdf9",
  },
  titulo: {
    fontSize: 23,
    fontWeight: "700",
    color: "#1D2A32",
    marginBottom: 6,
    marginTop: 20,
    textAlign: "center",
  },
  formulario: {
    paddingTop: 40,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  botonArea: {
    marginBottom: 46,
    paddingTop: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  inputDesign: {
    height: 50,
    backgroundColor: "#e1e1e1",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    marginBottom: 15,
    justifyContent: "center",
  },
  fecha: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 0.48,
  },
  btnGreen: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#259588",
    width: 150,
    height: 60,
    marginHorizontal: 10,
  },
  btnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  btnCancel: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#aaa",
    width: 150,
    height: 60,
    marginHorizontal: 10,
  },
  btnCancelText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 15,
    marginLeft: 8,
    fontWeight: "500",
    color: "#222",
  },
});

export default EditarEvento;
