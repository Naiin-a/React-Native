import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import Toast from "react-native-toast-message";
import styles from "./styleAdm";

// Importa as seções da tela administrativa
import EstoqueSection from "./EstoqueSection";
import ReceitasSection from "./ReceitasSection";
import FuncionariosSection from "./FuncionariosSection";
import AdminsSection from "./AdminsSection";
import RelatoriosSection from "./RelatoriosSection";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

// Funções de CRUD do Firestore
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentByName,
} from "../../firestoreAPI";

export default function AdmScreen({ user, onLogout }) {
  // Estado que controla qual seção está sendo exibida
  const [telaAtual, setTelaAtual] = useState("estoque");
  // Estado para controlar visibilidade do modal de exclusão
  const [modalVisivel, setModalVisivel] = useState(false);
  // ID do item selecionado para exclusão
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  // Tipo do item (ex: "funcionario", "admin")
  const [tipoItem, setTipoItem] = useState("");
  // Nome do item para exibir no modal
  const [itemParaExcluirNome, setItemParaExcluirNome] = useState("");
  // Altura da tela para passar para algumas seções
  const { height } = Dimensions.get("window");

  // Função chamada ao clicar em "excluir" em uma seção
  function confirmarExclusao(id, tipo, nome) {
    setItemParaExcluir(id); // define ID do item
    setTipoItem(tipo); // define tipo do item
    setItemParaExcluirNome(nome); // define nome do item
    setModalVisivel(true); // mostra modal de confirmação
  }

  // Função chamada quando o usuário confirma exclusão no modal
  async function confirmarExcluir() {
    // Dispara um evento customizado que será capturado pela seção correspondente
    document.dispatchEvent(
      new CustomEvent("deleteItem", {
        detail: { id: itemParaExcluir, tipo: tipoItem, nome: itemParaExcluirNome },
      })
    );
    setModalVisivel(false); // fecha o modal
  }

  // useEffect para carregar dados ao montar a tela
  useEffect(() => {
    document.dispatchEvent(new Event("carregarTudo")); // evento que carrega todas as seções
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Título e saudação */}
      <Text style={styles.title}>Painel Administrativo</Text>
      <Text style={styles.subtitle}>Olá, {user.nome}</Text>

      {/* Navegação entre seções */}
      <View style={styles.navButtonsRow}>
        <TouchableOpacity
          style={[
            styles.navButton,
            telaAtual === "estoque" && { backgroundColor: "#2E8B57" }, // cor ativa
          ]}
          onPress={() => setTelaAtual("estoque")} // muda seção
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

      {/* Renderização condicional das seções */}
      {telaAtual === "estoque" && (
        <EstoqueSection
          confirmarExclusao={confirmarExclusao} // passa função de exclusão
          height={height} // altura da tela
          getDocuments={getDocuments} // funções CRUD
          createDocument={createDocument}
          updateDocument={updateDocument}
          deleteDocument={deleteDocument}
          findDocumentByName={findDocumentByName}
          user={user} // usuário logado
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

      {/* Botão de logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: "#C0392B", width: 140 }]}
          onPress={onLogout} // função de logout
        >
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Rodapé */}
      <Text style={styles.copyText}>© 2025 Pomodoro. Todos os direitos reservados.</Text>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDeleteModal
        visible={modalVisivel} // controla visibilidade
        nome={itemParaExcluirNome} // mostra nome do item
        onCancel={() => setModalVisivel(false)} // cancelar exclusão
        onConfirm={confirmarExcluir} // confirma exclusão
      />

      {/* Componente de toast global */}
      <Toast />
    </ScrollView>
  );
}
