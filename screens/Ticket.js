import React from "react";
import { StyleSheet, View, Text, Button, ScrollView, TouchableOpacity } from "react-native";

const TicketScreen = () => {
  const ticket = {
    mesa: "M2",
    items: [
      { name: "Botella", quantity: 1 },
      { name: "Cubeta", quantity: 1 },
      { name: "Jugo", quantity: 0 },
      { name: "Mojito", quantity: 1 },
      { name: "Margarita", quantity: 1 },
      { name: "Mojito", quantity: 1 },
    ],
    total: 5900,
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.backButton}>{"<"}</Text>
        <Text style={styles.headerTitle}>Ticket</Text>
      </View>

      {/* Información del ticket */}
      <ScrollView style={styles.content}>
        <Text style={styles.mesaText}>Mesa: {ticket.mesa}</Text>
        <View style={styles.divider} />

        {/* Lista de productos */}
        {ticket.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>{item.quantity}</Text>
          </View>
        ))}

        {/* Total */}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>{ticket.total}</Text>
        </View>
      </ScrollView>

      {/* Botón de cobrar */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Seleccione la opción de cobrar una vez terminada la orden
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Cobrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    position: "absolute",
    left: 15,
    fontSize: 18,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    padding: 20,
  },
  mesaText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  footer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TicketScreen;
