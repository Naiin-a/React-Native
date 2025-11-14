import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import Toast from "react-native-toast-message";
import styles from "./styleAdm";

import EstoqueSection from "./EstoqueSection";
import ReceitasSection from "./ReceitasSection";
import FuncionariosSection from "./FuncionariosSection";
import AdminsSection from "./AdminsSection";
import RelatoriosSection from "./RelatoriosSection";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentByName,
} from "../../firestoreAPI";

export default function AdmScreen({ user, onLogout }) {
  const [telaAtual, setTelaAtual] = useState("estoque");
  const [modalVisivel, setModalVisivel] = useState(false);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [tipoItem, setTipoItem] = useState("");
  const [itemParaExcluirNome, setItemParaExcluirNome] = useState("");
  const { height } = Dimensions.get("window");

  function confirmarExclusao(id, tipo, nome) {
    setItemParaExcluir(id);
    setTipoItem(tipo);
    setItemParaExcluirNome(nome);
    setModalVisivel(true);
  }

  async function confirmarExcluir() {
    document.dispatchEvent(
      new CustomEvent("deleteItem", {
        detail: { id: itemParaExcluir, tipo: tipoItem, nome: itemParaExcluirNome },
      })
    );
    setModalVisivel(false);
  }

  useEffect(() => {
    document.dispatchEvent(new Event("carregarTudo"));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Painel Administrativo</Text>
      <Text style={styles.subtitle}>Olá, {user.nome}</Text>

      {/* Navegação estilizada */}
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

        <TouchableOpacity
          style={[
            styles.navButton,
            telaAtual === "funcionarios" && { backgroundColor: "#8E44AD" },
          ]}
          onPress={() => setTelaAtual("funcionarios")}
        >
          <Text style={styles.buttonText}>Funcionários</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            telaAtual === "admins" && { backgroundColor: "#9B59B6" },
          ]}
          onPress={() => setTelaAtual("admins")}
        >
          <Text style={styles.buttonText}>Admins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            telaAtual === "relatorios" && { backgroundColor: "#BDA42B" },
          ]}
          onPress={() => setTelaAtual("relatorios")}
        >
        <Text style={styles.buttonText}>Relatórios</Text>
        </TouchableOpacity>
      </View>

      {/* Seções */}
      {telaAtual === "estoque" && (
        <EstoqueSection
          confirmarExclusao={confirmarExclusao}
          height={height}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          findDocumentByName={findDocumentByName}
          user={user}
        />
      )}

      {telaAtual === "receitas" && (
        <ReceitasSection
          confirmarExclusao={confirmarExclusao}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          user={user}
        />
      )}

      {telaAtual === "funcionarios" && (
        <FuncionariosSection
          confirmarExclusao={confirmarExclusao}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          user={user}
        />
      )}

      {telaAtual === "admins" && (
        <AdminsSection
          confirmarExclusao={confirmarExclusao}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          user={user}
        />
      )}

      {telaAtual === "relatorios" && (
        <RelatoriosSection
          confirmarExclusao={confirmarExclusao}
          getDocuments={getDocuments}
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          user={user}
        />
      )}

      {/* Botão de saída separado */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: "#C0392B", width: 140 }]}
          onPress={onLogout}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDeleteModal
        visible={modalVisivel}
        nome={itemParaExcluirNome}
        onCancel={() => setModalVisivel(false)}
        onConfirm={confirmarExcluir}
      />

      <Toast />
    </ScrollView>
  );
}
