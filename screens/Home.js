import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bienvenido</Text>
      <Text style={styles.subtitulo}>Panchito</Text>
      <Text style={styles.titulo}>Hoy</Text>
      <Text style={styles.subtitulo}>17 de Enero</Text>
      <Text style={styles.subtitulo}>05:56</Text>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        alignItems: "center",
        justifyContent: "center",
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
})