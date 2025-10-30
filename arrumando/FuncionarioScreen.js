import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { getDocuments, updateDocument } from "./firestoreAPI";
import styles from "./styles";

export default function FuncionarioScreen({ user, onLogout }) {
  const [estoque, setEstoque] = useState([]);

  async function carregarEstoque() {
    const docs = await getDocuments("estoque");
    const itens = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome.stringValue,
        quantidade: parseInt(f.quantidade.integerValue),
      };
    });
    setEstoque(itens);
  }

  async function retirarItem(id) {
    const item = estoque.find((i) => i.id === id);
    if (!item || item.quantidade <= 0) return;
    await updateDocument("estoque", id, { quantidade: item.quantidade - 1 });
    carregarEstoque();
  }

  useEffect(() => {
    carregarEstoque();
    
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Area do Funcionario</Text>
      <Text style={styles.subtitle}>Ola, {user.nome}</Text>
      <Button title="Receitas" onPress={() => setTelaAtual("receitas")} />
      <FlatList
        data={estoque}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.nome} - {item.quantidade}</Text>
            {item.quantidade > 0 && (
              <Button title="Retirar 1" onPress={() => retirarItem(item.id)} />
            )}
          </View>
        )}
      />

      <Button title="Sair" color="red" onPress={onLogout} />
    </View>
  );
  
} 
