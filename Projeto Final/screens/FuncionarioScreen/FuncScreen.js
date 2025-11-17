import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message"; // Biblioteca para mensagens rápidas (sucesso/erro)

import styles from "./styleFunc"; // Importa estilos da tela
import { getDocuments, updateDocument } from "../../firestoreAPI"; // Funções para interagir com Firestore
import { adicionarRelatorio, printarRelatorios } from "../../relatorioAPI"; // Funções para registrar ações de usuário

import EstoqueSection from "./EstoqueSection"; // Componente da seção de estoque
import ReceitasSection from "./ReceitasSection"; // Componente da seção de receitas
import ConfirmarReceitaModal from "./ConfirmarReceitaModal"; // Modal de confirmação de receita

export default function FuncScreen({ user, onLogout }) {
  // === Estados ===
  const [telaAtual, setTelaAtual] = useState("receitas"); // Tela ativa: "estoque" ou "receitas"
  const [estoque, setEstoque] = useState([]); // Lista de itens do estoque
  const [receitas, setReceitas] = useState([]); // Lista de receitas
  const [receitaSelecionada, setReceitaSelecionada] = useState(null); // Receita selecionada para confirmação
  const [modalVisivel, setModalVisivel] = useState(false); // Controla visibilidade do modal

  // Cria um mapa do estoque para acesso rápido por ID
  const estoqueMap = React.useMemo(() => {
    const map = {};
    estoque.forEach((e) => {
      map[e.id] = e;
    });
    return map;
  }, [estoque]);

  // === Configuração customizada de Toast ===
  const toastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: "#2ECC71",
          backgroundColor: "#1E1E1E",
          borderRadius: 12,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#FFFFFF",
        }}
        text2Style={{
          fontSize: 14,
          color: "#CCCCCC",
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: "#E74C3C",
          backgroundColor: "#1E1E1E",
          borderRadius: 12,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: "bold",
          color: "#FFFFFF",
        }}
        text2Style={{
          fontSize: 14,
          color: "#CCCCCC",
        }}
      />
    ),
  };

  // === Funções para carregar dados ===

  // Carrega itens do estoque do Firestore
  async function carregarEstoque() {
    try {
      const docs = await getDocuments("estoque");
      const itens = docs.map((doc) => {
        const f = doc.fields || {};
        const quantidade = f.quantidade?.integerValue || "0";
        return {
          id: doc.name.split("/").pop(), // Extrai ID do documento
          nome: f.nome?.stringValue || "Sem nome",
          quantidade: parseInt(quantidade),
        };
      });
      itens.sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena alfabeticamente
      setEstoque(itens); // Atualiza estado
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao carregar estoque",
        text2: "Tente novamente mais tarde.",
        position: "bottom",
      });
    }
  }

  // Carrega receitas do Firestore
  async function carregarReceitas() {
    try {
      const docs = await getDocuments("receitas");
      const recs = docs.map((doc) => {
        const f = doc.fields;
        const itens =
          f.itens?.arrayValue?.values?.map((v) => {
            const campos = v.mapValue?.fields || {};
            return {
              itemId: campos.itemId?.stringValue || "",
              quantidade: parseInt(campos.quantidade?.integerValue || "0"),
            };
          }) || [];
        return {
          id: doc.name.split("/").pop(),
          nome: f.nome?.stringValue || "Sem nome",
          itens,
        };
      });
      setReceitas(recs); // Atualiza estado
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
    }
  }

  // === Função para confirmar preparo de receita ===
  /** @param setEsperando {(boolean) => void} será chamado com valor `true` após verificações iniciais e `false` após o término da confirmação */
  async function confirmarReceita(setEsperando) {
    if (!receitaSelecionada) return;
    setEsperando(true); // põe a bolinha de carregamento

    // Verifica se todos os itens da receita estão disponíveis no estoque
    const todosDisponiveis = receitaSelecionada.itens.every((i) => {
      const estoqueItem = estoqueMap[i.itemId];
      return estoqueItem && estoqueItem.quantidade >= i.quantidade;
    });

    if (!todosDisponiveis) {
      Toast.show({
        type: "error",
        text1: "Itens insuficientes",
        text2: "Verifique o estoque antes de prosseguir.",
        position: "bottom",
      });
      setModalVisivel(false);
      return;
    }

    // Atualiza quantidade no Firestore
    for (const i of receitaSelecionada.itens) {
      const estoqueItem = estoqueMap[i.itemId];
      await updateDocument("estoque", i.itemId, {
        quantidade: estoqueItem.quantidade - i.quantidade,
      });
    }

    // Adiciona registro no relatório
    adicionarRelatorio(user, `preparou a receita ${receitaSelecionada.nome}.`);

    // Recarrega dados atualizados
    await carregarEstoque();
    await carregarReceitas();

    // Mostra feedback de sucesso
    Toast.show({
      type: "success",
      text1: "Receita concluída!",
      text2: "Estoque atualizado com sucesso.",
      position: "bottom",
    });

    setEsperando(false); // utilizado para tirar a bolinha de carregamento
    setModalVisivel(false); // Fecha modal
    setReceitaSelecionada(null); // Limpa seleção
  }

  // Abre modal de confirmação de receita
  function abrirConfirmacao(receita) {
    setReceitaSelecionada(receita);
    setModalVisivel(true);
  }

  // Carrega estoque e receitas ao montar o componente
  useEffect(() => {
    carregarEstoque();
    carregarReceitas();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Área do Funcionário</Text>
      <Text style={styles.subtitle}>Olá, {user.nome}</Text>

      {/* Botões de navegação entre telas */}
      <View style={styles.navButtonsRow}>
        <TouchableOpacity
          style={[
            styles.navButton,
            telaAtual === "estoque" && { backgroundColor: "#2E8B57" },
          ]}
          onPress={() => setTelaAtual("estoque")}
        >
          <Text style={styles.buttonText}>Estoque</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            telaAtual === "receitas" && { backgroundColor: "#4682B4" },
          ]}
          onPress={() => setTelaAtual("receitas")}
        >
          <Text style={styles.buttonText}>Receitas</Text>
        </TouchableOpacity>
      </View>

      {/* Renderiza conteúdo conforme tela selecionada */}
      {telaAtual === "estoque" && (
        <EstoqueSection
          estoque={estoque}
          setEstoque={setEstoque}
          carregarEstoque={carregarEstoque}
          user={user}
        />
      )}

      {telaAtual === "receitas" && (
        <ReceitasSection
          receitas={receitas}
          estoque={estoque}
          abrirConfirmacao={abrirConfirmacao}
          user={user}
        />
      )}

      {/* Modal de confirmação de preparo de receita */}
      <ConfirmarReceitaModal
        modalVisivel={modalVisivel}
        receitaSelecionada={receitaSelecionada}
        confirmarReceita={confirmarReceita}
        setModalVisivel={setModalVisivel}
        estoque={estoque}
      />

      {/* Botão de logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: "#C0392B", width: 140 }]}
          onPress={onLogout}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.copyText}>© 2025 Pomodoro. Todos os direitos reservados.</Text>
      
      {/* Componente Toast */}
      <Toast config={toastConfig} />
    </View>
  );
}
