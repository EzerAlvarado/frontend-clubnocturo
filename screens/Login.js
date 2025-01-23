import {StyleSheet,SafeAreaView, View, Text, TouchableOpacity, TextInput, Alert, Image} from 'react-native'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React from 'react'

const Login = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#18243a" }}>
      <KeyboardAwareScrollView style={styles.container}>
        <View style={styles.header}>
            <Image style={styles.LoginImage} source={require('../assets/login2.png')}/>
        </View>

        <View style={styles.formulario}>
            <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.input}>
            <TextInput/>
          </View>

            <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.input}>
            <TextInput/>
          </View>

          <View style={styles.botonArea}>

            <TouchableOpacity>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Iniciar Sesion</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default Login

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
      },
      titulo: {
        fontSize: 31,
        fontWeight: "700",
        color: "#1D2A32",
        marginBottom: 6,
      },
      subtitulo: {
        fontSize: 15,
        fontWeight: "500",
        color: "#929292",
      },
      textoError: {
        fontSize: 15,
        fontWeight: "500",
        color: "#929292",
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
        borderRadius: 10
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
        borderStyle: "solid",
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
      LoginImage:{
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 125,
        width: 130,
        height: 150,
      },
})