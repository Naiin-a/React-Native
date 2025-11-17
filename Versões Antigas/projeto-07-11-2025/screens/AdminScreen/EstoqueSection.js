import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import styles from "./styleAdm";

export default function EstoqueSection({
  confirmarExclusao,
  height,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentByName,
}) {
  const [estoque, setEstoque] = useState([]);
  const [novoNome, setNovoNome] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  async function carregarEstoque() {
    try {
      const docs = await getDocuments("estoque");
      const itens = docs.map((doc) => {
        const f = doc.fields || {};
        const quantidade = f.quantidade?.integerValue || "0";
        return {
          id: doc.name.split("/").pop(),
          nome: f.nome?.stringValue || "Sem nome",
          quantidade: parseInt(quantidade),
        };
      });
      itens.sort((a, b) => a.nome.localeCompare(b.nome));
      setEstoque(itens);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível carregar o estoque.",
        position: "top",
        topOffset: height / 2,
      });
    }
  }

  async function salvarItem() {
    if (!novoNome || !novaQuantidade) return;
    const qtd = parseInt(novaQuantidade);
    if (isNaN(qtd) || qtd < 0) return;

    if (editandoId) {
      await updateDocument("estoque", editandoId, { nome: novoNome, quantidade: qtd });
      Toast.show({
        type: "success",
        text1: "Item atualizado",
        text2: `"${novoNome}" foi atualizado com sucesso!`,
        position: "top",
        topOffset: height / 2,
      });
    } else {
      const existente = await findDocumentByName("estoque", novoNome);
      if (existente) {
        const id = existente.id;
        const atual = parseInt(existente.fields.quantidade.integerValue);
        await updateDocument("estoque", id, { quantidade: atual + qtd });
        Toast.show({
          type: "success",
          text1: "Quantidade atualizada",
          text2: `"${novoNome}" teve a quantidade incrementada!`,
          position: "top",
          topOffset: height / 2,
        });
      } else {
        await createDocument("estoque", { nome: novoNome, quantidade: qtd });
        Toast.show({
          type: "success",
          text1: "Item criado",
          text2: `"${novoNome}" foi adicionado ao estoque!`,
          position: "bottom",
        });
      }
    }
    setNovoNome("");
    setNovaQuantidade("");
    setEditandoId(null);
    carregarEstoque();
  }

  async function excluirItem(id, nome) {
    try {
      await deleteDocument("estoque", id);
      carregarEstoque();
      Toast.show({
        type: "success",
        text1: "Item excluído",
        text2: `"${nome}" foi removido do estoque.`,
        position: "bottom",
      });
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível excluir o item.",
        position: "bottom",
      });
    }
  }

  useEffect(() => {
    carregarEstoque();
    const deletar = (e) => {
      if (e.detail.tipo === "estoque") excluirItem(e.detail.id, e.detail.nome);
    };
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarEstoque);
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarEstoque);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Gerenciar Estoque</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do item"
        placeholderTextColor="#888"
        value={novoNome}
        onChangeText={setNovoNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantidade"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={novaQuantidade}
        onChangeText={setNovaQuantidade}
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={salvarItem}>
        <Text style={styles.buttonText}>
          {editandoId ? "Atualizar Item" : "Salvar Item"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.textinho, { marginTop: 16 }]}>Itens em estoque:</Text>

      <FlatList
        data={estoque}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFF", fontWeight: "bold" }}>{item.nome}</Text>
              <Text style={{ color: "#BBB", fontSize: 12 }}>
                Quantidade: {item.quantidade}
              </Text>
            </View>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.buttonEdit}
                onPress={() => {
                  setEditandoId(item.id);
                  setNovoNome(item.nome);
                  setNovaQuantidade(item.quantidade.toString());
                }}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonDelete}
                onPress={() => confirmarExclusao(item.id, "estoque", item.nome)}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
