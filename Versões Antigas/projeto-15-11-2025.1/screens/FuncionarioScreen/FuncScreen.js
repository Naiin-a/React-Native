import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

import styles from "./styleFunc";
import { getDocuments, updateDocument } from "../../firestoreAPI";
import { adicionarRelatorio, printarRelatorios } from "../../relatorioAPI";

import EstoqueSection from "./EstoqueSection";
import ReceitasSection from "./ReceitasSection";
import ConfirmarReceitaModal from "./ConfirmarReceitaModal";

export default function FuncScreen({ user, onLogout }) {
  const [telaAtual, setTelaAtual] = useState("receitas");
  const [estoque, setEstoque] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [receitaSelecionada, setReceitaSelecionada] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  // === Toast customizado ===
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

  // === Carregar dados ===
  async function carregarEstoque() {
    try {
      const docs = await getDocuments("estoque");
      const itens = docs.map((doc) => {
        const f = doc.fields || {};
        const quantidade = f.quantidade?.integerValue || "0";
        return {
          id: doc.name.split("/").pop(),
          nome: f.nome?.stringValue || "Sem nome",
          quantidade: parseInt(quantidade),
        };
      });
      itens.sort((a, b) => a.nome.localeCompare(b.nome));
      setEstoque(itens);
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
      setReceitas(recs);
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
    }
  }

  // === Confirmar receita ===
  async function confirmarReceita() {
    if (!receitaSelecionada) return;

    const todosDisponiveis = receitaSelecionada.itens.every((i) => {
      const estoqueItem = estoque.find((e) => e.id === i.itemId);
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

    for (const i of receitaSelecionada.itens) {
      const estoqueItem = estoque.find((e) => e.id === i.itemId);
      await updateDocument("estoque", i.itemId, {
        quantidade: estoqueItem.quantidade - i.quantidade,
      });
    }

    adicionarRelatorio(user, `preparou a receita ${receitaSelecionada.nome}.`);

    await carregarEstoque();
    await carregarReceitas();

    Toast.show({
      type: "success",
      text1: "Receita concluída!",
      text2: "Estoque atualizado com sucesso.",
      position: "bottom",
    });

    setModalVisivel(false);
    setReceitaSelecionada(null);
  }

  function abrirConfirmacao(receita) {
    setReceitaSelecionada(receita);
    setModalVisivel(true);
  }

  useEffect(() => {
    carregarEstoque();
    carregarReceitas();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Área do Funcionário</Text>
      <Text style={styles.subtitle}>Olá, {user.nome}</Text>

      {/* Botões de navegação */}
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

      {/* Conteúdo dinâmico */}
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
      <Toast config={toastConfig} />
    </View>
  );
}
