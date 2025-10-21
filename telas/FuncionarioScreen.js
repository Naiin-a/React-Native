import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function FuncionarioScreen({ route, navigation }) {
  const { userData } = route.params;

  const handleLogout = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo(a), {userData.nome}</Text>
      <Text>CPF: {userData.cpf}</Text>
      <Text>Cargo: {userData.cargo}</Text>

      <TouchableOpacity style={styles.botaoLogout} onPress={handleLogout}>
        <Text style={styles.logoutTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  botaoLogout: { backgroundColor: "#dc3545", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8, marginTop: 30 },
  logoutTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
