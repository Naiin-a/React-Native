import React from "react";
import { Modal, View, Text, Button } from "react-native";
import styles from "./styleAdm";

export default function ConfirmDeleteModal({ visible, nome, onCancel, onConfirm }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Tem certeza que quer excluir "{nome}"?
          </Text>
          <View style={styles.modalButtons}>
            <Button title="Cancelar" onPress={onCancel} />
            <View style={{ width: 10 }} />
            <Button title="Excluir" color="red" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
