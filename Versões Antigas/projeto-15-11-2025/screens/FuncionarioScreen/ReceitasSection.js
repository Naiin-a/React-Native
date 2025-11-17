import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import styles from "./styleFunc";

export default function ReceitasSection({ receitas, estoque, abrirConfirmacao }) {

  // Cria um mapa do estoque para acesso rápido por ID
  const estoqueMap = React.useMemo(() => {
    const map = {};
    estoque.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [estoque]);

  return (
    <FlatList
      data={receitas} // Lista de receitas para renderizar
      keyExtractor={(item) => item.id} // Define a chave única de cada item
      showsVerticalScrollIndicator={false} // Oculta a barra de rolagem vertical
      scrollEventThrottle={16} // Frequência de atualização do scroll
      renderItem={({ item }) => {
        // Verifica se todos os itens da receita estão disponíveis no estoque
        const todosDisponiveis = item.itens.every((i) => {
          const estoqueItem = estoqueMap[i.itemId];
          return estoqueItem && estoqueItem.quantidade >= i.quantidade;
        });

        return (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              {/* Nome da receita */}
              <Text style={styles.recipeTitle}>{item.nome}</Text>

              {/* Lista os itens da receita com quantidade */}
              {item.itens.map((i) => {
                const estoqueItem = estoqueMap[i.itemId];

                return (
                  <Text key={i.itemId} style={styles.recipeItemText}>
                    • {estoqueItem ? estoqueItem.nome : "[Item não disponível]"}:{" "}
                    {i.quantidade}
                  </Text>
                );
              })}
            </View>

            {/* Botão de ação ou aviso de itens insuficientes */}
            {todosDisponiveis ? (
              <TouchableOpacity
                style={styles.makeButton}
                onPress={() => abrirConfirmacao(item)} // Abre modal de confirmação
              >
                <Text style={styles.makeButtonText}>Fazer</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.insufficientText}>Itens insuficientes</Text>
            )}
          </View>
        );
      }}
      // Componente exibido quando não há receitas
      ListEmptyComponent={
        <Text style={styles.emptyText}>Nenhuma receita cadastrada.</Text>
      }
    />
  );
}
