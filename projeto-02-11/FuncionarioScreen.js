import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList } from "react-native";
import { getDocuments, updateDocument } from "./firestoreAPI";
import { Modal, TouchableOpacity, } from "react-native";
import Toast from 'react-native-toast-message';

import styles from "./styles";

export default function FuncionarioScreen({ user, onLogout }) {
  
  const [telaAtual, setTelaAtual] = useState("estoque");
  const [estoque, setEstoque] = useState([]);
  const [receitas, setReceitas] = useState([]);

  const [receitaSelecionada, setReceitaSelecionada] = useState(null); // receita clicada
  const [modalVisivel, setModalVisivel] = useState(false);


                      {/* === ESTOQUE === */}
async function carregarEstoque() {
  try {
    const docs = await getDocuments("estoque");

    const itens = docs.map((doc) => {
      const f = doc.fields || {};
      const quantidade = f.quantidade?.integerValue || '0';
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome?.stringValue || 'Sem nome',
        quantidade: parseInt(quantidade),
      };
    });

    // Ordena por nome para facilitar visualização
    itens.sort((a, b) => a.nome.localeCompare(b.nome));

    setEstoque(itens);
  } catch (error) {
  console.error("Erro ao carregar estoque:", error);
  Toast.show({
    type: 'error',
    text1: 'Erro',
    text2: 'Não foi possível carregar o estoque',
    position: 'bottom',
  });
  }}



async function retirarItem(id) {
  const item = estoque.find((i) => i.id === id);
  if (!item || item.quantidade <= 0) return;

  // Atualiza o estado local primeiro
  setEstoque(prev =>
    prev.map(e =>
      e.id === id ? { ...e, quantidade: e.quantidade - 1 } : e
    )
  );

try {
  await updateDocument("estoque", id, { quantidade: item.quantidade - 1 });
  Toast.show({
    type: 'success',
    text1: 'Item retirado com sucesso!',
    position: 'bottom',
  });
} catch (error) {
  console.error("Erro ao atualizar estoque:", error);
  Toast.show({
    type: 'error',
    text1: 'Erro',
    text2: 'Não foi possível atualizar o estoque',
    position: 'bottom',
  });



    // Se falhar, reverte o estado local
    setEstoque(prev =>
      prev.map(e =>
        e.id === id ? { ...e, quantidade: e.quantidade + 1 } : e
      )
    );
  }
}



                          {/* === RECEITAS === */}
async function carregarReceitas() {
  const docs = await getDocuments("receitas");
  const recs = docs.map(doc => {
    const f = doc.fields;
    const itens = f.itens?.arrayValue?.values?.map(v => {
      const campos = v.mapValue?.fields || {};
      return {
        itemId: campos.itemId?.stringValue || '',
        quantidade: parseInt(campos.quantidade?.integerValue || '0'),
      };
    }) || [];
    return {
      id: doc.name.split('/').pop(),
      nome: f.nome?.stringValue || 'Sem nome',
      itens,
    };
  });
  setReceitas(recs);

}
// === NOVA FUNÇÃO PARA RETIRAR 1 RECEITA ===
async function retirarReceita(id) {
  const receita = receitas.find(r => r.id === id);
  if (!receita) return;

  // Verifica se todos os itens estão disponíveis
  const todosDisponiveis = receita.itens.every(i => {
    const estoqueItem = estoque.find(e => e.id === i.itemId);
    return estoqueItem && estoqueItem.quantidade >= i.quantidade;
  });

 if (!todosDisponiveis) {
  Toast.show({
    type: 'error',
    text1: 'Erro',
    text2: 'Itens insuficientes',
    position: 'bottom',
  });
  setModalVisivel(false);
  return;
}
 // aborta a operação

  // Atualiza a quantidade de cada item
  for (const i of receita.itens) {
    const estoqueItem = estoque.find(e => e.id === i.itemId);
    await updateDocument("estoque", i.itemId, {
      quantidade: estoqueItem.quantidade - i.quantidade
    });
  }



  await carregarEstoque();
  await carregarReceitas();
}

async function confirmarReceita() {
  if (!receitaSelecionada) return;

  const todosDisponiveis = receitaSelecionada.itens.every(i => {
    const estoqueItem = estoque.find(e => e.id === i.itemId);
    return estoqueItem && estoqueItem.quantidade >= i.quantidade;
  });

if (!todosDisponiveis) {
  Toast.show({
    type: 'error', // tipo de toast
    text1: 'Erro',
    text2: 'Itens insuficientes',
    position: 'bottom',
  });
  setModalVisivel(false);
  return;
}


  for (const i of receitaSelecionada.itens) {
    const estoqueItem = estoque.find(e => e.id === i.itemId);
    await updateDocument("estoque", i.itemId, {
      quantidade: estoqueItem.quantidade - i.quantidade
    });
  }

  await carregarEstoque();
  await carregarReceitas();

  
    Toast.show({
      type: 'success',
      text1: 'Receita realizada com sucesso!',
      position: 'bottom',
    });

  setModalVisivel(false);
  setReceitaSelecionada(null);
}


  function abrirConfirmacao(receita) {
  setReceitaSelecionada(receita);
  setModalVisivel(true);
}


              {/* === CARREGAMENTO === */}
  useEffect(() => {
    carregarEstoque();
    carregarReceitas();
  }, []);

                          {/* === TELA === */}
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Area do Funcionario</Text>
      <Text style={styles.subtitle}>Ola, {user.nome}</Text>
      <View style={styles.row}>
      <Button title="Estoque" onPress={() => setTelaAtual("estoque")} />
      <Button title="Receitas" onPress={() => setTelaAtual("receitas")} />
      </View>

      
      {telaAtual === "estoque" && (
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
)}

{telaAtual === "receitas" && (
  <FlatList
    data={receitas}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => {
      // Verifica se todos os itens da receita têm quantidade suficiente
      const todosDisponiveis = item.itens.every(i => {
        const estoqueItem = estoque.find(e => e.id === i.itemId);
        return estoqueItem && estoqueItem.quantidade >= i.quantidade;
      });

      return (
        <View style={styles.listItem}>
          <Text style={{ fontWeight: "bold" }}>{item.nome}</Text>
          {item.itens.map(i => {
          const estoqueItem = estoque.find(e => e.id === i.itemId);
          return (
            <Text key={i.itemId} style={{ fontSize: 12, color: "#555" }}>
              • {estoqueItem ? estoqueItem.nome : "[Item não disponível]"}: {i.quantidade}
            </Text>
          );
        })}


          {todosDisponiveis ? (
            <Button title="Fazer" onPress={() => abrirConfirmacao(item)} />

          ) : (
            <Text style={{ color: "red", marginTop: 5 }}>Itens insuficientes</Text>
          )}
        </View>
      );
    }}
  />
)}

<Modal
  visible={modalVisivel}
  transparent={true}
  animationType="slide"
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Confirmar Receita</Text>
      {receitaSelecionada?.itens.map(i => {
        const estoqueItem = estoque.find(e => e.id === i.itemId);
        return (
          <Text key={i.itemId} style={styles.modalItemText}>
            • {estoqueItem ? estoqueItem.nome : "Item removido"}: {i.quantidade}
          </Text>
        );
      })}
      <View style={styles.modalButtons}>
        <Button title="Cancelar" onPress={() => setModalVisivel(false)} />
        <Button title="Confirmar" onPress={confirmarReceita} />
      </View>
    </View>
  </View>
</Modal>


{/* Toast global */}
      <Toast />

      <Button title="Sair" color="red" onPress={onLogout} />
    </View>
  );
  
} 
