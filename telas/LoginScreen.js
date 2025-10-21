import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

const FIREBASE_URL_ADMIN = "https://firestore.googleapis.com/v1/projects/projetoadm-b4da5/databases/(default)/documents/admins";
const FIREBASE_URL_FUNC = "https://firestore.googleapis.com/v1/projects/projetoadm-b4da5/databases/(default)/documents/funcionarios";

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    const isAdmin = usuario.includes("@");
    const url = isAdmin ? FIREBASE_URL_ADMIN : FIREBASE_URL_FUNC;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.documents) {
        Alert.alert("Erro", "Nenhum usuário encontrado no banco!");
        return;
      }

      const lista = data.documents.map((doc) => {
        const f = doc.fields;
        return {
          id: doc.name.split("/").pop(),
          nome: f.nome?.stringValue || "",
          email: f.email?.stringValue || "",
          cpf: f.cpf?.stringValue || "",
          senha: f.senha?.stringValue || "",
          cargo: f.cargo?.stringValue || "",
        };
      });

      const user = isAdmin
        ? lista.find((u) => u.email === usuario && u.senha === senha)
        : lista.find((u) => u.cpf === usuario && u.senha === senha);

      if (user) {
        if (isAdmin) {
          navigation.replace("Admin", { userData: user });
        } else {
          navigation.replace("Funcionario", { userData: user });
        }
      } else {
        Alert.alert("Erro", "Usuário ou senha incorretos!");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao conectar ao banco de dados!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email (Admin) ou CPF (Funcionário)"
        value={usuario}
        onChangeText={setUsuario}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <TouchableOpacity style={styles.botao} onPress={handleLogin}>
        <Text style={styles.botaoTexto}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
  titulo: { fontSize: 28, fontWeight: "bold", marginBottom: 30 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  botao: { backgroundColor: "#007bff", padding: 14, borderRadius: 8, width: "100%", alignItems: "center" },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
