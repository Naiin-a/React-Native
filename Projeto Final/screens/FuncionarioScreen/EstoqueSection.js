import React from "react"; 
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message"; // para mostrar mensagens rápidas de feedback
import { updateDocument } from "../../firestoreAPI"; // função para atualizar documento no Firestore
import { adicionarRelatorio } from "../../relatorioAPI"; // função para registrar ações do usuário
import styles from "./styleFunc"; // estilos compartilhados entre telas

export default function EstoqueSection({ estoque, setEstoque, user }) {
  // Função para retirar 1 unidade de um item do estoque
  async function retirarItem(id) {
    // Encontra o item no array de estoque
    const item = estoque.find((i) => i.id === id);

    // Se item não existe ou quantidade <= 0, exibe erro e retorna
    if (!item || item.quantidade <= 0) {
      Toast.show({
        type: "error",
        text1: "Estoque vazio",
        text2: "Esse item já está zerado.",
        position: "bottom",
      });
      return;
    }

    // Atualiza localmente a quantidade do item no estado
    setEstoque(prev => {
      const index = prev.findIndex(e => e.id === id); // encontra índice do item
      if (index === -1) return prev; // se não encontrado, mantém o array
      const newArr = [...prev]; // cria cópia do array
      newArr[index] = { ...newArr[index], quantidade: newArr[index].quantidade - 1 }; // decrementa quantidade
      return newArr;
    });

    try {
      // Atualiza o estoque no banco de dados
      await updateDocument("estoque", id, { quantidade: item.quantidade - 1 });

      // Adiciona ação no relatório
      adicionarRelatorio(user, `retirou 1 ${item.nome} do estoque. Restam ${item.quantidade - 1}.`);

      // Mostra notificação de sucesso
      Toast.show({
        type: "success",
        text1: "Item retirado com sucesso!",
        position: "bottom",
      });
    } catch (error) {
      // Em caso de erro ao atualizar o Firestore
      console.error("Erro ao atualizar estoque:", error);

      // Adiciona relatório de falha
      adicionarRelatorio(user, `tentou retirar 1 ${item.nome} do estoque e houve impedimento por erro do sistema.`);

      // Mostra notificação de erro
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar o estoque",
        position: "bottom",
      });

      // Reverte a quantidade local caso haja erro
      setEstoque(prev => {
        const index = prev.findIndex(e => e.id === id);
        if (index === -1) return prev;
        const newArr = [...prev];
        newArr[index] = { ...newArr[index], quantidade: newArr[index].quantidade + 1 };
        return newArr;
      });
    }
  }

  // Renderiza a lista de itens do estoque
  return (
    <FlatList
      data={estoque} // dados da lista
      extraData={estoque} // força atualização quando estoque muda
      keyExtractor={(item) => item.id} // chave única para cada item
      showsVerticalScrollIndicator={false} // remove barra de rolagem
      scrollEventThrottle={16} // taxa de atualização da rolagem
      contentContainerStyle={{ paddingVertical: 10 }} // espaçamento interno
      ListEmptyComponent={
        <Text style={styles.emptyText}>Nenhum item no estoque.</Text> // mensagem quando não há itens
      }
      renderItem={({ item }) => (
        <View style={styles.listItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.recipeTitle}>{item.nome}</Text> {/* nome do item */}
            <Text style={styles.recipeItemText}>Qtd: {item.quantidade}</Text> {/* quantidade atual */}
          </View>

          {/* Se houver estoque, permite retirar 1 unidade */}
          {item.quantidade > 0 ? (
            <TouchableOpacity
              style={styles.makeButton}
              onPress={() => retirarItem(item.id)}
            >
              <Text style={styles.makeButtonText}>Retirar 1</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.insufficientText}>Sem estoque</Text> // caso estoque zerado
          )}
        </View>
      )}
    />
  );
}
