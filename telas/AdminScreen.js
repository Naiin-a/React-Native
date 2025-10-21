import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from "react-native";

const FIREBASE_URL_FUNC = "https://firestore.googleapis.com/v1/projects/projetoadm-b4da5/databases/(default)/documents/funcionarios";

export default function AdminScreen({ navigation }) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [cargo, setCargo] = useState("");

  const carregarFuncionarios = async () => {
    try {
      const response = await fetch(FIREBASE_URL_FUNC);
      const data = await response.json();

      if (!data.documents) {
        setFuncionarios([]);
        return;
      }

      const lista = data.documents.map((doc) => {
        const f = doc.fields;
        return {
          id: doc.name.split("/").pop(),
          nome: f.nome?.stringValue || "",
          cpf: f.cpf?.stringValue || "",
          senha: f.senha?.stringValue || "",
          cargo: f.cargo?.stringValue || "",
        };
      });
      setFuncionarios(lista);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar funcionários!");
    }
  };

  const adicionarFuncionario = async () => {
    if (!nome || !cpf || !senha || !cargo) {
      Alert.alert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      await fetch(FIREBASE_URL_FUNC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            nome: { stringValue: nome },
            cpf: { stringValue: cpf },
            senha: { stringValue: senha },
            cargo: { stringValue: cargo },
          },
        }),
      });
      setNome("");
      setCpf("");
      setSenha("");
      setCargo("");
      carregarFuncionarios();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível adicionar o funcionário!");
    }
  };

  const deletarFuncionario = async (id) => {
    try {
      await fetch(`${FIREBASE_URL_FUNC}/${id}`, { method: "DELETE" });
      carregarFuncionarios();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível deletar o funcionário!");
    }
  };

  const handleLogout = () => {
    navigation.replace("Login");
  };

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Painel do Administrador</Text>
        <TouchableOpacity style={styles.botaoLogout} onPress={handleLogout}>
          <Text style={styles.logoutTexto}>Sair</Text>
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="CPF" value={cpf} onChangeText={setCpf} />
      <TextInput style={styles.input} placeholder="Senha" value={senha} onChangeText={setSenha} />
      <TextInput style={styles.input} placeholder="Cargo" value={cargo} onChangeText={setCargo} />

      <TouchableOpacity style={styles.botao} onPress={adicionarFuncionario}>
        <Text style={styles.botaoTexto}>Adicionar Funcionário</Text>
      </TouchableOpacity>

      <FlatList
        data={funcionarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nome} ({item.cargo})</Text>
            <TouchableOpacity onPress={() => deletarFuncionario(item.id)}>
              <Text style={{ color: "red" }}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  titulo: { fontSize: 24, fontWeight: "bold" },
  botaoLogout: { backgroundColor: "#dc3545", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  logoutTexto: { color: "#fff", fontWeight: "bold" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },
  botao: { backgroundColor: "#007bff", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
