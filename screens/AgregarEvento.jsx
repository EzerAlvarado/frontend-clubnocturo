import React from 'react';
import { StyleSheet, View, Text,  TextInput, 
  TouchableOpacity,SafeAreaView, Platform, 
  ScrollView,
  KeyboardAvoidingView, } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';


const AgregarEvento = () => {
  const [date, setDate] = React.useState(new Date()); // Estado para manejar la fecha
  const [show, setShow] = React.useState(false); // Estado para mostrar/ocultar el picker

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios'); // Ocultar en Android al seleccionar
    setDate(currentDate); // Actualizar fecha seleccionada
  };

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

    <View style={styles.container}>

        <Text style={styles.titulo}> Nuevo Evento </Text>

      
      <View style={styles.formulario}>
          

          <Text style={styles.inputLabel}>Fecha</Text>
          
           {/* Botón para abrir el picker */}
        <TouchableOpacity onPress={() => setShow(true)} style={styles.inputDesign}>
          <Text style={styles.fecha}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {/* Mostrar el DateTimePicker solo si `show` es true */}
        {show && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}

          <Text style={styles.inputLabel}>Nombre</Text>
          <TextInput
          style={styles.inputDesign}
          placeholder="Ingrese el nombre del evento"
          maxLength={150}
          />

          <Text style={styles.inputLabel}>Número</Text>
          <TextInput
          style={styles.inputDesign}
          keyboardType="numeric"
          placeholder="ingrese su número telefónico"
          />


      </View>
      <View style={styles.botonArea}>
        <TouchableOpacity style={styles.btnGreen}>
          <Text style={styles.btnText}>Guardar</Text>
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
    flexShrink: 1,
    flexBasis: 0,
    backgroundColor: "#fffdf9",

   
  },
  titulo: {
    fontSize: 23,
    fontWeight: "700",
    color: "#1D2A32",
    marginBottom: 6,
    marginTop: 20,
    textAlign: 'center'
  },
  subtitulo: {
    fontSize: 15,
    fontWeight: "500",
    color: "#676767",
    textAlign: "center",
  },

  //Header
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
    marginTop: 30
  },

  //Formulario area
  formulario: {
    paddingTop: 40,
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },

  //Boton Area
  botonArea: {
    //marginTop: 111,
    marginBottom: 46,
    paddingTop: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  // Inputs

  inputLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
    //fontWeight: 'bold'
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

  

  },

  fecha: {
    fontSize: 15,
    fontWeight: "500",
    textAlign: 'justify',
    marginTop: 12
  },

  //Botones
  btnGreen: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#259588",
    width: 180,
    height: 60,
    marginHorizontal: 25,
  },

  btnText: {
    fontSize: 18,
    //lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});
export default AgregarEvento;