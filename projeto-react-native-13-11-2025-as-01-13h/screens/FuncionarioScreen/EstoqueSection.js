import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { updateDocument } from "../../firestoreAPI";
import { adicionarRelatorio } from "../../relatorioAPI";
import styles from "./styleFunc";

export default function EstoqueSection({ estoque, setEstoque, user }) {
  async function retirarItem(id) {
    const item = estoque.find((i) => i.id === id);
    if (!item || item.quantidade <= 0) {
      Toast.show({
        type: "error",
        text1: "Estoque vazio",
        text2: "Esse item já está zerado.",
        position: "bottom",
      });
      return;
    }

    // Atualiza localmente
    setEstoque((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, quantidade: e.quantidade - 1 } : e
      )
    );

    try {
      await updateDocument("estoque", id, { quantidade: item.quantidade - 1 });
      adicionarRelatorio(user, `retirou 1 ${item.nome} do estoque. Restam ${item.quantidade - 1}.`);
      Toast.show({
        type: "success",
        text1: "Item retirado com sucesso!",
        position: "bottom",
      });
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      adicionarRelatorio(user, `tentou retirar 1 ${item.nome} do estoque e houve impedimento por erro do sistema.`);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar o estoque",
        position: "bottom",
      });

      // Reverte se der erro
      setEstoque((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, quantidade: e.quantidade + 1 } : e
        )
      );
    }
  }

  return (
    <FlatList
      data={estoque}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingVertical: 10 }}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Nenhum item no estoque.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.recipeTitle}>{item.nome}</Text>
            <Text style={styles.recipeItemText}>Qtd: {item.quantidade}</Text>
          </View>

          {item.quantidade > 0 ? (
            <TouchableOpacity
              style={styles.makeButton}
              onPress={() => retirarItem(item.id)}
            >
              <Text style={styles.makeButtonText}>Retirar 1</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.insufficientText}>Sem estoque</Text>
          )}
        </View>
      )}
    />
  );
}
