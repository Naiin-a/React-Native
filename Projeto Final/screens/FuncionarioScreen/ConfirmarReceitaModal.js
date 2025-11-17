import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import styles from "./styleFunc"; // mesmo estilo usado nas outras telas

export default function ConfirmarReceitaModal({
  modalVisivel,          // controla se o modal está visível ou não
  receitaSelecionada,    // objeto da receita que será confirmada
  confirmarReceita,      // função que será chamada ao confirmar a receita
  setModalVisivel,       // função para atualizar a visibilidade do modal
  estoque,               // lista de itens disponíveis no estoque
}) {

  const [esperando, setEsperando] = useState(false);

  // ⚡ Cria um mapa de estoque para acesso rápido pelo itemId
  // Evita percorrer todo o array de estoque toda vez que precisar do nome
  const estoqueMap = React.useMemo(() => {
    const map = {};
    estoque.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [estoque]);


  return (
    // Modal transparente com animação fade
    <Modal visible={modalVisivel} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Confirmar Receita</Text>

          {/* Lista os itens da receita */}
          {receitaSelecionada?.itens.map((i) => {
            const estoqueItem = estoqueMap[i.itemId]; // pega o item do estoque pelo ID
            return (
              <Text key={i.itemId} style={styles.modalItemText}>
                {/* Se o item existe no estoque mostra o nome, senão indica "Item removido" */}
                • {estoqueItem ? estoqueItem.nome : "Item removido"}: {i.quantidade}
              </Text>
            );
          })}

          {/* Botões de ação do modal */}
          <View style={styles.modalButtons}>
            {/* Botão para cancelar e fechar o modal */}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>

            {/* Botão para confirmar a receita */}
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={() => {
                if (esperando) {return;}
                confirmarReceita(setEsperando);
              }}
            >
              {esperando ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.modalButtonText}>Confirmar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
