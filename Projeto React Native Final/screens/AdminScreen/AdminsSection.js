import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { adicionarRelatorio } from "../../relatorioAPI";
import styles from "./styleAdm";

export default function AdminsSection({
  confirmarExclusao,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  user,
}) {
  const [admins, setAdmins] = useState([]);
  const [nomeAdm, setNomeAdm] = useState("");
  const [emailAdm, setEmailAdm] = useState("");
  const [senhaAdm, setSenhaAdm] = useState("");
  const [tipoAdm, setTipoAdm] = useState("");
  const [editandoAdmId, setEditandoAdmId] = useState(null);
  const [admOriginal, setAdmOriginal] = useState(null);

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
      adicionarRelatorio(user, (`atualizou o registro do(a) administrador(a) ${admOriginal.nome} ` + (admOriginal.nome === dados.nome ? "" : `(agora ${dados.nome}) `) + `no sistema:\n` +
      (admOriginal.nome === dados.nome ? "" : `- Nome: de ${admOriginal.nome} para ${dados.nome};\n`) +
      (admOriginal.email === dados.email ? "" : `- E-Mail: de ${admOriginal.email} para ${dados.email};\n`) +
      (admOriginal.senha === dados.senha ? "" : `- Senha: foi alterada;\n`)).trimEnd()
      );
    } else {
      await createDocument("admins", dados);
      adicionarRelatorio(user, `registrou administrador(a) ${dados.nome} no sistema (e-mail: ${dados.email}).`);
    }

    setNomeAdm("");
    setEmailAdm("");
    setSenhaAdm("");
    setTipoAdm("");
    setAdmOriginal(null);
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

  async function excluirAdm(id, nome) {
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
      adicionarRelatorio(user, `excluiu administrador(a) ${nome} do sistema.`);
      carregarAdmins();
    } catch (error) {
      console.error("Erro ao excluir adm:", error);
      adicionarRelatorio(user, `tentou excluir administrador(a) ${nome} do sistema, mas houve impedimento por erro do sistema.`);
    }
  }

  useEffect(() => {
    carregarAdmins();

    const deletar = (e) => {
      if (e.detail.tipo === "adm") excluirAdm(e.detail.id, e.detail.nome);
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

            {/* 🔹 Botões lado a lado */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <TouchableOpacity
                style={[styles.buttonEdit, { flex: 1 }]}
                onPress={() => {
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
