import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import styles from "./styleFunc"; // mesmo estilo usado nas outras telas

export default function ConfirmarReceitaModal({
  modalVisivel,
  receitaSelecionada,
  confirmarReceita,
  setModalVisivel,
  estoque,
}) {
  return (
    <Modal visible={modalVisivel} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirmar Receita</Text>

          {receitaSelecionada?.itens.map((i) => {
            const estoqueItem = estoque.find((e) => e.id === i.itemId);
            return (
              <Text key={i.itemId} style={styles.modalItemText}>
                • {estoqueItem ? estoqueItem.nome : "Item removido"}: {i.quantidade}
              </Text>
            );
          })}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={confirmarReceita}
            >
              <Text style={styles.modalButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
