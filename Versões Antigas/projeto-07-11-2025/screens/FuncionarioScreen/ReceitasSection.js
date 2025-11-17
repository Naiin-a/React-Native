import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import styles from "./styleFunc";

export default function ReceitasSection({ receitas, estoque, abrirConfirmacao }) {
  return (
    <FlatList
      data={receitas}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      renderItem={({ item }) => {
        const todosDisponiveis = item.itens.every((i) => {
          const estoqueItem = estoque.find((e) => e.id === i.itemId);
          return estoqueItem && estoqueItem.quantidade >= i.quantidade;
        });

        return (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recipeTitle}>{item.nome}</Text>

              {item.itens.map((i) => {
                const estoqueItem = estoque.find((e) => e.id === i.itemId);
                return (
                  <Text key={i.itemId} style={styles.recipeItemText}>
                    • {estoqueItem ? estoqueItem.nome : "[Item não disponível]"}:{" "}
                    {i.quantidade}
                  </Text>
                );
              })}
            </View>

            {todosDisponiveis ? (
              <TouchableOpacity
                style={styles.makeButton}
                onPress={() => abrirConfirmacao(item)}
              >
                <Text style={styles.makeButtonText}>Fazer</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.insufficientText}>Itens insuficientes</Text>
            )}
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Nenhuma receita cadastrada.</Text>
      }
    />
  );
}
