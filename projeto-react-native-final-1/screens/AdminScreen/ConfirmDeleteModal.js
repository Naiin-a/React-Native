import React from "react";
import { Modal, View, Text, Button } from "react-native";
import styles from "./styleAdm";

// Componente de modal para confirmação de exclusão
export default function ConfirmDeleteModal({ visible, nome, onCancel, onConfirm }) {
  return (
    // Modal nativo do React Native
    <Modal
      transparent // deixa fundo transparente
      visible={visible} // controla visibilidade
      animationType="fade" // animação de entrada/saída
      onRequestClose={onCancel} // comportamento do botão de voltar no Android
    >
      {/* Container centralizado do modal */}
      <View style={styles.modalContainer}>
        {/* Conteúdo do modal */}
        <View style={styles.modalContent}>
          {/* Título com nome do item a ser excluído */}
          <Text style={styles.modalTitle}>
            Tem certeza que quer excluir "{nome}"?
          </Text>

          {/* Botões de ação */}
          <View style={styles.modalButtons}>
            {/* Botão de cancelar */}
            <Button title="Cancelar" onPress={onCancel} />

            {/* Espaçamento entre os botões */}
            <View style={{ width: 10 }} />

            {/* Botão de confirmar exclusão */}
            <Button title="Excluir" color="red" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
