import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import styles from "./styleAdm";

export default function FuncionariosSection({
  confirmarExclusao,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
}) {
  const [funcionarios, setFuncionarios] = useState([]);
  const [nomeFunc, setNomeFunc] = useState("");
  const [emailFunc, setEmailFunc] = useState("");
  const [senhaFunc, setSenhaFunc] = useState("");
  const [tipoFunc, setTipoFunc] = useState("");
  const [editandoFuncId, setEditandoFuncId] = useState(null);

  async function carregarFuncionarios() {
    const docs = await getDocuments("usuarios");
    const lista = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome.stringValue,
        email: f.email.stringValue,
        senha: f.senha.stringValue,
        tipo: f.tipo?.stringValue || "",
      };
    });
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
    setFuncionarios(lista);
  }

  async function salvarFuncionario() {
    if (!nomeFunc || !emailFunc || !senhaFunc) return;

    const funcionariosDocs = await getDocuments("usuarios");
    const adminsDocs = await getDocuments("admins");
    const todos = [...funcionariosDocs, ...adminsDocs];

    const emailExiste = todos.some((doc) => {
      const f = doc.fields;
      const id = doc.name.split("/").pop();
      return (
        f.email.stringValue.toLowerCase() === emailFunc.toLowerCase() &&
        id !== editandoFuncId
      );
    });

    if (!emailFunc.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Email Inválido",
        text2: "Insira um email valido",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    if (senhaFunc.length < 8) {
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
      nome: nomeFunc,
      email: emailFunc,
      senha: senhaFunc,
      tipo: tipoFunc || "funcionario",
    };

    if (editandoFuncId) {
      await updateDocument("usuarios", editandoFuncId, dados);
    } else {
      await createDocument("usuarios", dados);
    }

    setNomeFunc("");
    setEmailFunc("");
    setSenhaFunc("");
    setTipoFunc("");
    setEditandoFuncId(null);
    carregarFuncionarios();

    Toast.show({
      type: "success",
      text1: "Sucesso",
      text2: `Funcionário ${editandoFuncId ? "atualizado" : "cadastrado"} com sucesso!`,
      position: "top",
      visibilityTime: 2000,
    });
  }

  async function excluirFuncionario(id) {
    try {
      await deleteDocument("usuarios", id);
      carregarFuncionarios();
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
    }
  }

  useEffect(() => {
    carregarFuncionarios();

    const deletar = (e) => {
      if (e.detail.tipo === "funcionario") excluirFuncionario(e.detail.id);
    };
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarFuncionarios);
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarFuncionarios);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Gerenciar Funcionários</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        placeholderTextColor="#888"
        value={nomeFunc}
        onChangeText={setNomeFunc}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={emailFunc}
        onChangeText={setEmailFunc}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        value={senhaFunc}
        onChangeText={setSenhaFunc}
        secureTextEntry
      />

      <TouchableOpacity style={styles.buttonPrimary} onPress={salvarFuncionario}>
        <Text style={styles.buttonText}>
          {editandoFuncId ? "Atualizar Funcionário" : "Salvar Funcionário"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.textinho, { marginTop: 16 }]}>Funcionários cadastrados:</Text>

      <FlatList
        data={funcionarios}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", color: "#FFF" }}>{item.nome}</Text>
              <Text style={{ color: "#BBB", fontSize: 12 }}>{item.email}</Text>
            </View>

            {/* 🔹 Botões lado a lado */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
              <TouchableOpacity
                style={[styles.buttonEdit, { flex: 1 }]}
                onPress={() => {
                  setEditandoFuncId(item.id);
                  setNomeFunc(item.nome);
                  setEmailFunc(item.email);
                  setSenhaFunc(item.senha);
                }}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.buttonDelete, { flex: 1 }]}
                onPress={() => confirmarExclusao(item.id, "funcionario", item.nome)}
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
