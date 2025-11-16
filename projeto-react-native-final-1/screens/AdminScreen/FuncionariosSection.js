import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { adicionarRelatorio } from "../../relatorioAPI";
import styles from "./styleAdm";

export default function FuncionariosSection({
  confirmarExclusao, // função para confirmar exclusão de funcionário
  getDocuments,      // função para buscar documentos do banco
  createDocument,    // função para criar documento no banco
  updateDocument,    // função para atualizar documento existente
  deleteDocument,    // função para deletar documento
  user,              // usuário logado (para relatórios)
}) {
  // Estados do componente
  const [funcionarios, setFuncionarios] = useState([]); // lista de funcionários
  const [nomeFunc, setNomeFunc] = useState("");          // nome do funcionário no formulário
  const [emailFunc, setEmailFunc] = useState("");        // email do funcionário no formulário
  const [senhaFunc, setSenhaFunc] = useState("");        // senha do funcionário no formulário
  const [tipoFunc, setTipoFunc] = useState("");          // tipo (funcionario/admin)
  const [editandoFuncId, setEditandoFuncId] = useState(null); // id do funcionário que está sendo editado
  const [funcOriginal, setFuncOriginal] = useState(null);     // usado para relatórios (dados antigos)

  // Função para carregar funcionários do banco
  async function carregarFuncionarios() {
    const docs = await getDocuments("usuarios"); // buscar todos os usuários
    const lista = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),  // extrair ID do documento
        nome: f.nome.stringValue,       // nome
        email: f.email.stringValue,     // email
        senha: f.senha.stringValue,     // senha
        tipo: f.tipo?.stringValue || "",// tipo (opcional)
      };
    });
    lista.sort((a, b) => a.nome.localeCompare(b.nome)); // ordenar alfabeticamente
    setFuncionarios(lista); // atualizar estado
  }

  // Função para salvar (criar ou atualizar) funcionário
  async function salvarFuncionario() {
    if (!nomeFunc || !emailFunc || !senhaFunc) return; // validação básica

    // buscar todos os usuários e admins para verificar duplicidade de email
    const funcionariosDocs = await getDocuments("usuarios");
    const adminsDocs = await getDocuments("admins");
    const todos = [...funcionariosDocs, ...adminsDocs];

    // verifica se email já existe, ignorando o próprio editado
    const emailExiste = todos.some((doc) => {
      const f = doc.fields;
      const id = doc.name.split("/").pop();
      return (
        f.email.stringValue.toLowerCase() === emailFunc.toLowerCase() &&
        id !== editandoFuncId
      );
    });

    // validação de email
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

    // validação de senha
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

    // alerta caso email já exista
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

    // dados do funcionário para salvar
    const dados = {
      nome: nomeFunc,
      email: emailFunc,
      senha: senhaFunc,
      tipo: tipoFunc || "funcionario",
    };

    if (editandoFuncId) {
      // atualizar funcionário existente
      await updateDocument("usuarios", editandoFuncId, dados);

      // criar relatório detalhando alterações
      adicionarRelatorio(
        user,
        (`atualizou o registro do(a) funcionário(a) ${funcOriginal.nome} ` +
          (funcOriginal.nome === dados.nome ? "" : `(agora ${dados.nome}) `) +
          `no sistema:\n` +
          (funcOriginal.nome === dados.nome ? "" : `- Nome: de ${funcOriginal.nome} para ${dados.nome};\n`) +
          (funcOriginal.email === dados.email ? "" : `- E-Mail: de ${funcOriginal.email} para ${dados.email};\n`) +
          (funcOriginal.senha === dados.senha ? "" : `- Senha: foi alterada;\n`)
        ).trimEnd()
      );
    } else {
      // criar novo funcionário
      await createDocument("usuarios", dados);
      adicionarRelatorio(user, `registrou funcionário(a) ${dados.nome} no sistema (e-mail: ${dados.email}).`);
    }

    // resetar formulário
    setNomeFunc("");
    setEmailFunc("");
    setSenhaFunc("");
    setTipoFunc("");
    setFuncOriginal(null);
    setEditandoFuncId(null);

    // recarregar lista
    carregarFuncionarios();

    // feedback de sucesso
    Toast.show({
      type: "success",
      text1: "Sucesso",
      text2: `Funcionário ${editandoFuncId ? "atualizado" : "cadastrado"} com sucesso!`,
      position: "top",
      visibilityTime: 2000,
    });
  }

  // Função para excluir funcionário
  async function excluirFuncionario(id, nome) {
    try {
      await deleteDocument("usuarios", id); // deletar do banco
      adicionarRelatorio(user, `excluiu funcionário(a) ${nome} do sistema.`);
      carregarFuncionarios(); // atualizar lista
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
      adicionarRelatorio(
        user,
        `tentou excluir funcionário(a) ${nome} do sistema, mas houve impedimento por erro do sistema.`
      );
    }
  }

  // useEffect para carregar funcionários e registrar eventos globais
  useEffect(() => {
    carregarFuncionarios(); // carregar ao montar

    // função para deletar via evento customizado
    const deletar = (e) => {
      if (e.detail.tipo === "funcionario") excluirFuncionario(e.detail.id, e.detail.nome);
    };

    // registrar eventos
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarFuncionarios);

    // cleanup
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarFuncionarios);
    };
  }, []);

  // renderização do componente
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Gerenciar Funcionários</Text>

      {/* Campos do formulário */}
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

      {/* Botão de salvar/atualizar */}
      <TouchableOpacity style={styles.buttonPrimary} onPress={salvarFuncionario}>
        <Text style={styles.buttonText}>
          {editandoFuncId ? "Atualizar Funcionário" : "Salvar Funcionário"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.textinho, { marginTop: 16 }]}>Funcionários cadastrados:</Text>

      {/* Lista de funcionários */}
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
                  setFuncOriginal(item);       // guardar dados antigos para relatório
                  setEditandoFuncId(item.id);  // marcar como editando
                  setNomeFunc(item.nome);      // preencher formulário
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
