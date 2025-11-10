import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import styles from "./styleAdm";

export default function AdminsSection({
  confirmarExclusao,
  user,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
}) {
  const [admins, setAdmins] = useState([]);
  const [nomeAdm, setNomeAdm] = useState("");
  const [emailAdm, setEmailAdm] = useState("");
  const [senhaAdm, setSenhaAdm] = useState("");
  const [tipoAdm, setTipoAdm] = useState("");
  const [editandoAdmId, setEditandoAdmId] = useState(null);

  async function carregarAdmins() {
    const docs = await getDocuments("admins");
    const lista = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome.stringValue,
        email: f.email.stringValue,
        senha: f.senha.stringValue,
        tipo: f.tipo?.stringValue || "adm",
      };
    });
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
    setAdmins(lista);
  }

  async function salvarAdm() {
    if (!nomeAdm || !emailAdm || !senhaAdm) return;

    const adminsDocs = await getDocuments("admins");
    const funcionariosDocs = await getDocuments("usuarios");
    const todos = [...adminsDocs, ...funcionariosDocs];

    const emailExiste = todos.some((doc) => {
      const f = doc.fields;
      const id = doc.name.split("/").pop();
      return (
        f.email.stringValue.toLowerCase() === emailAdm.toLowerCase() &&
        id !== editandoAdmId
      );
    });
    // --- NOVA VALIDAÇÃO DE EMAIL ---
    if (!emailAdm.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Email Inválido",
        text2: "Insira um email valido",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    // --- NOVA VALIDAÇÃO DE SENHA ---
    if (senhaAdm.length < 8) {
      Toast.show({
        type: "error",
        text1: "Senha Inválida",
        text2: "A senha deve ter no mínimo 6 caracteres.",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

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

    const dados = {
      nome: nomeAdm,
      email: emailAdm,
      senha: senhaAdm,
      tipo: tipoAdm || "adm",
    };

    if (editandoAdmId) {
      await updateDocument("admins", editandoAdmId, dados);
    } else {
      await createDocument("admins", dados);
    }

    setNomeAdm("");
    setEmailAdm("");
    setSenhaAdm("");
    setTipoAdm("");
    setEditandoAdmId(null);
    carregarAdmins();

    Toast.show({
      type: "success",
      text1: "Sucesso",
      text2: `Adm ${editandoAdmId ? "atualizado" : "cadastrado"} com sucesso!`,
      position: "top",
      visibilityTime: 2000,
    });
  }
 

  async function excluirAdm(id) {
    if (id === user.id) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Você não pode excluir sua própria conta!",
      });
      return;
    }

    try {
      await deleteDocument("admins", id);
      carregarAdmins();
    } catch (error) {
      console.error("Erro ao excluir adm:", error);
    }
  }

  useEffect(() => {
    carregarAdmins();

    const deletar = (e) => {
      if (e.detail.tipo === "adm") excluirAdm(e.detail.id);
    };
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarAdmins);
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarAdmins);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Gerenciar Administradores</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#888"
        value={nomeAdm}
        onChangeText={setNomeAdm}
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
        secureTextEntry
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={salvarAdm}>
        <Text style={styles.buttonText}>
          {editandoAdmId ? "Atualizar" : "Salvar"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={admins}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={{ color: "#FFF", marginBottom: 8 }}>
              {item.nome} - {item.email}
            </Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.buttonEdit}
                onPress={() => {
                  setEditandoAdmId(item.id);
                  setNomeAdm(item.nome);
                  setEmailAdm(item.email);
                  setSenhaAdm(item.senha);
                }}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonDelete}
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
