import React, { useEffect, useState } from "react"; // Importa React e hooks
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native"; // Componentes visuais
import Toast from "react-native-toast-message"; // Para mostrar mensagens temporárias
import { adicionarRelatorio } from "../../relatorioAPI"; // Função para registrar ações no sistema
import styles from "./styleAdm"; // Importa estilos do componente

export default function AdminsSection({
  confirmarExclusao, // Função para abrir modal de confirmação de exclusão
  getDocuments, // Função para buscar documentos do Firestore
  createDocument, // Função para criar documentos
  updateDocument, // Função para atualizar documentos
  deleteDocument, // Função para deletar documentos
  user, // Usuário logado
}) {
  // Estados locais
  const [admins, setAdmins] = useState([]); // Lista de admins
  const [nomeAdm, setNomeAdm] = useState(""); // Nome do admin no formulário
  const [emailAdm, setEmailAdm] = useState(""); // Email do admin no formulário
  const [senhaAdm, setSenhaAdm] = useState(""); // Senha do admin no formulário
  const [tipoAdm, setTipoAdm] = useState(""); // Tipo do admin (padrão "adm")
  const [editandoAdmId, setEditandoAdmId] = useState(null); // ID do admin em edição
  const [admOriginal, setAdmOriginal] = useState(null); // Dados originais do admin antes da edição

  // Função para carregar administradores do Firestore
  async function carregarAdmins() {
    const docs = await getDocuments("admins"); // Pega todos os admins
    const lista = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(), // Extrai ID do documento
        nome: f.nome.stringValue, // Nome do admin
        email: f.email.stringValue, // Email do admin
        senha: f.senha.stringValue, // Senha do admin
        tipo: f.tipo?.stringValue || "adm", // Tipo, default "adm"
      };
    });
    lista.sort((a, b) => a.nome.localeCompare(b.nome)); // Ordena por nome
    setAdmins(lista); // Atualiza o estado da lista
  }

  // Função para salvar ou atualizar admin
  async function salvarAdm() {
    // Se algum campo obrigatório estiver vazio, não faz nada
    if (!nomeAdm || !emailAdm || !senhaAdm) return;

    // Busca todos os admins e usuários para validar emails duplicados
    const adminsDocs = await getDocuments("admins");
    const funcionariosDocs = await getDocuments("usuarios");
    const todos = [...adminsDocs, ...funcionariosDocs];

    // Checa se o email já existe em outro usuário/admin
    const emailExiste = todos.some((doc) => {
      const f = doc.fields;
      const id = doc.name.split("/").pop();
      return (
        f.email.stringValue.toLowerCase() === emailAdm.toLowerCase() && // Mesma string ignorando maiúsculas/minúsculas
        id !== editandoAdmId // Ignora o admin que está sendo editado
      );
    });

    // Validação de formato de email
    if (!emailAdm.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Email Inválido",
        text2: "Insira um email válido",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    // Validação mínima de senha (8 caracteres)
    if (senhaAdm.length < 8) {
      Toast.show({
        type: "error",
        text1: "Senha Inválida",
        text2: "A senha deve ter no mínimo 8 caracteres.",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    // Validação de email duplicado
    if (emailExiste) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Este email já está cadastrado!",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    // Monta o objeto com os dados a serem salvos
    const dados = {
      nome: nomeAdm,
      email: emailAdm,
      senha: senhaAdm,
      tipo: tipoAdm || "adm", // Se não informar tipo, assume "adm"
    };

    // Se estiver editando, atualiza documento existente
    if (editandoAdmId) {
      await updateDocument("admins", editandoAdmId, dados);

      // Adiciona relatório detalhado de alterações
      adicionarRelatorio(
        user,
        (`atualizou o registro do(a) administrador(a) ${admOriginal.nome} ` +
          (admOriginal.nome === dados.nome ? "" : `(agora ${dados.nome}) `) +
          `no sistema:\n` +
          (admOriginal.nome === dados.nome ? "" : `- Nome: de ${admOriginal.nome} para ${dados.nome};\n`) +
          (admOriginal.email === dados.email ? "" : `- E-Mail: de ${admOriginal.email} para ${dados.email};\n`) +
          (admOriginal.senha === dados.senha ? "" : `- Senha: foi alterada;\n`)
        ).trimEnd()
      );
    } else {
      // Se não estiver editando, cria novo admin
      await createDocument("admins", dados);
      adicionarRelatorio(user, `registrou administrador(a) ${dados.nome} no sistema (e-mail: ${dados.email}).`);
    }

    // Limpa campos do formulário após salvar
    setNomeAdm("");
    setEmailAdm("");
    setSenhaAdm("");
    setTipoAdm("");
    setAdmOriginal(null);
    setEditandoAdmId(null);

    carregarAdmins(); // Recarrega a lista de admins

    // Mostra mensagem de sucesso
    Toast.show({
      type: "success",
      text1: "Sucesso",
      text2: `Adm ${editandoAdmId ? "atualizado" : "cadastrado"} com sucesso!`,
      position: "top",
      visibilityTime: 2000,
    });
  }

  // Função para excluir admin
  async function excluirAdm(id, nome) {
    // Impede exclusão do próprio usuário logado
    if (id === user.id) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Você não pode excluir sua própria conta!",
      });
      return;
    }

    try {
      await deleteDocument("admins", id); // Deleta documento
      adicionarRelatorio(user, `excluiu administrador(a) ${nome} do sistema.`);
      carregarAdmins(); // Atualiza lista
    } catch (error) {
      console.error("Erro ao excluir adm:", error);
      adicionarRelatorio(user, `tentou excluir administrador(a) ${nome} do sistema, mas houve impedimento por erro do sistema.`);
    }
  }

  // useEffect para carregar admins e registrar listeners de eventos
  useEffect(() => {
    carregarAdmins(); // Carrega admins ao montar componente

    // Listener para evento de exclusão
    const deletar = (e) => {
      if (e.detail.tipo === "adm") excluirAdm(e.detail.id, e.detail.nome);
    };

    // Registra listeners
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarAdmins); // Recarrega lista ao receber evento

    return () => {
      // Remove listeners ao desmontar componente
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarAdmins);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Gerenciar Administradores</Text>

      {/* Inputs do formulário */}
      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#888"
        value={nomeAdm}
        onChangeText={setNomeAdm} // Atualiza estado
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={emailAdm}
        onChangeText={setEmailAdm}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        value={senhaAdm}
        onChangeText={setSenhaAdm}
        secureTextEntry // Oculta senha
      />

      {/* Botão salvar/atualizar */}
      <TouchableOpacity style={styles.buttonPrimary} onPress={salvarAdm}>
        <Text style={styles.buttonText}>
          {editandoAdmId ? "Atualizar" : "Salvar"}
        </Text>
      </TouchableOpacity>

      {/* Lista de administradores */}
      <FlatList
        data={admins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={{ color: "#FFF", marginBottom: 8 }}>
              {item.nome} - {item.email}
            </Text>

            {/* Botões Editar e Excluir lado a lado */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <TouchableOpacity
                style={[styles.buttonEdit, { flex: 1 }]}
                onPress={() => {
                  // Preenche formulário com dados do admin selecionado
                  setAdmOriginal(item);
                  setEditandoAdmId(item.id);
                  setNomeAdm(item.nome);
                  setEmailAdm(item.email);
                  setSenhaAdm(item.senha);
                }}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.buttonDelete, { flex: 1 }]}
                onPress={() => confirmarExclusao(item.id, "adm", item.nome)}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
