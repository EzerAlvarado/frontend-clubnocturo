// Login.jsx
import React, { useState, useContext } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthContext } from '../AuthContext';
import API_URL from '../url';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);


  // Variable de IP 
  const IP = API_URL;


  const handleLogin = async () => {
    try {
      // Realizamos una petición GET al endpoint (aunque en un caso real lo ideal es usar POST)
      const response = await fetch(`http://${IP}:8000/club/usuarios/`);
      const usuarios = await response.json();

      // Buscamos el usuario cuyo correo_cliente coincida y cuyo número de celular (como string) sea la password
      const usuarioEncontrado = usuarios.find(
        (usuario) =>
          usuario.correo_cliente.toLowerCase() === email.toLowerCase() &&
          usuario.contrasena.toString() === password
      );

      if (usuarioEncontrado) {
        // Almacena el usuario en el contexto
        setUser(usuarioEncontrado);
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#18243a" }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
          <Image style={styles.LoginImage} source={require('../assets/login2.png')} />
        </View>

        <View style={styles.formulario}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.input}>
            <TextInput
              style={styles.inputDesign}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.input}>
            <TextInput
              style={styles.inputDesign}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.botonArea}>
            <TouchableOpacity onPress={handleLogin}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Iniciar Sesion</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 36,
  },
  formulario: {
    paddingTop: 40,
    marginBottom: 24,
    paddingHorizontal: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  botonArea: {
    marginTop: 4,
    marginBottom: 16,
    paddingTop: 30,
    alignItems: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#2a3d61",
    borderRadius: 10,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  inputDesign: {
    height: 50,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    borderWidth: 1,
    borderColor: "#C9D3DB",
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#259588",
    borderColor: "#2b2b2b",
    width: 170,
    height: 60,
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    color: "#fff",
  },
  LoginImage: {
    borderRadius: 125,
    width: 130,
    height: 150,
  },
});
