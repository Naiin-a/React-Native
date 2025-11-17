import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentByName,
}  from "./firestoreAPI";
import styles from "./styles";

export default function AdmScreen({ user, onLogout }) {
  const [telaAtual, setTelaAtual] = useState("estoque");

  // === ESTOQUE ===
  const [estoque, setEstoque] = useState([]);
  const [novoNome, setNovoNome] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  async function carregarEstoque() {
    const docs = await getDocuments("estoque");
    const itens = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome.stringValue,
        quantidade: parseInt(f.quantidade.integerValue),
      };
    });
    itens.sort((a, b) => a.nome.localeCompare(b.nome));
    setEstoque(itens);
  }

  async function salvarItem() {
    if (!novoNome || !novaQuantidade) return;
    const qtd = parseInt(novaQuantidade);
    if (isNaN(qtd) || qtd < 0) return;

    if (editandoId) {
      await updateDocument("estoque", editandoId, { nome: novoNome, quantidade: qtd });
    } else {
      const existente = await findDocumentByName("estoque", novoNome);
      if (existente) {
        const id = existente.id;
        const atual = parseInt(existente.fields.quantidade.integerValue);
        await updateDocument("estoque", id, { quantidade: atual + qtd });
      } else {
        await createDocument("estoque", { nome: novoNome, quantidade: qtd });
      }
    }
    setNovoNome("");
    setNovaQuantidade("");
    setEditandoId(null);
    carregarEstoque();
  }

  async function excluirItem(id) {
    await deleteDocument("estoque", id);
    carregarEstoque();
  }

  // === RECEITAS ===
  const [receitas, setReceitas] = useState([]);
  const [novaReceitaNome, setNovaReceitaNome] = useState("");
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [editandoReceitaId, setEditandoReceitaId] = useState(null);

  async function carregarReceitas() {
    const docs = await getDocuments("receitas");
    const recs = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome.stringValue,
        itens: f.itens?.arrayValue?.values?.map((v) => ({
          itemId: v.mapValue.fields.itemId.stringValue,
          quantidade: parseInt(v.mapValue.fields.quantidade.integerValue),
        })) || [],
      };
    });
    setReceitas(recs);
  }

  function toggleItemSelecionado(itemId) {
    setItensSelecionados((prev) =>
      prev.some((i) => i.itemId === itemId)
        ? prev.filter((i) => i.itemId !== itemId)
        : [...prev, { itemId, quantidade: 1 }]
    );
  }

  async function salvarReceita() {
    if (!novaReceitaNome || itensSelecionados.length === 0) return;
    const itensParaSalvar = itensSelecionados.map((i) => ({
      itemId: i.itemId,
      quantidade: i.quantidade,
    }));

    if (editandoReceitaId) {
      await updateDocument("receitas", editandoReceitaId, { nome: novaReceitaNome, itens: itensParaSalvar });
    } else {
      await createDocument("receitas", { nome: novaReceitaNome, itens: itensParaSalvar });
    }
    setNovaReceitaNome("");
    setItensSelecionados([]);
    setEditandoReceitaId(null);
    carregarReceitas();
  }

  async function excluirReceita(id) {
    await deleteDocument("receitas", id);
    carregarReceitas();
  }

  // === FUNCIONÁRIOS ===
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
    const dados = { nome: nomeFunc, email: emailFunc, senha: senhaFunc, tipo: tipoFunc || "funcionario" };

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
  }

  async function excluirFuncionario(id) {
    await deleteDocument("usuarios", id);
    carregarFuncionarios();
  }

  // === ADMINS ===
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
    const dados = { nome: nomeAdm, email: emailAdm, senha: senhaAdm, tipo: tipoAdm || "adm" };

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
  }

  async function excluirAdm(id) {
    await deleteDocument("admins", id);
    carregarAdmins();
  }

  // === EFEITO INICIAL ===
  useEffect(() => {
    carregarEstoque();
    carregarReceitas();
    carregarFuncionarios();
    carregarAdmins();
  }, []);

  // === INTERFACE ===
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Painel Administrativo</Text>
      <Text style={styles.subtitle}>Olá, {user.nome}</Text>

      <View style={styles.row}>
        <Button title="Estoque" onPress={() => setTelaAtual("estoque")} />
        <Button title="Receitas" onPress={() => setTelaAtual("receitas")} />
        <Button title="Funcionários" onPress={() => setTelaAtual("funcionarios")} />
        <Button title="Admins" onPress={() => setTelaAtual("admins")} />
        <Button title="Sair" color="red" onPress={onLogout} />
      </View>

      {/* === ESTOQUE === */}
      {telaAtual === "estoque" && (
        <View>
          <Text style={styles.subtitle}>Gerenciar Estoque</Text>
          <TextInput style={styles.input} placeholder="Nome do item" value={novoNome} onChangeText={setNovoNome} />
          <TextInput style={styles.input} placeholder="Quantidade" keyboardType="numeric" value={novaQuantidade} onChangeText={setNovaQuantidade} />
          <Button title="Salvar" onPress={salvarItem} />
          <FlatList
            data={estoque}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text>{item.nome} - {item.quantidade}</Text>
                <View style={styles.row}>
                  <Button title="Editar" onPress={() => {
                    setEditandoId(item.id);
                    setNovoNome(item.nome);
                    setNovaQuantidade(item.quantidade.toString());
                  }} />
                  <Button title="Excluir" color="red" onPress={() => excluirItem(item.id)} />
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* === RECEITAS === */}
      {telaAtual === "receitas" && (
        <View>
          <Text style={styles.subtitle}>Gerenciar Receitas</Text>
          <TextInput style={styles.input} placeholder="Nome da receita" value={novaReceitaNome} onChangeText={setNovaReceitaNome} />
          <Text style={styles.bold}>Selecionar Itens:</Text>
          {estoque.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => toggleItemSelecionado(item.id)}>
              <Text style={{ color: itensSelecionados.some((i) => i.itemId === item.id) ? "green" : "black" }}>
                {item.nome}
              </Text>
            </TouchableOpacity>
          ))}
          <Button title="Salvar Receita" onPress={salvarReceita} />
          <FlatList
            data={receitas}
            keyExtractor={(r) => r.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text>{item.nome}</Text>
                <Button title="Excluir" color="red" onPress={() => excluirReceita(item.id)} />
              </View>
            )}
          />
        </View>
      )}

      {/* === FUNCIONÁRIOS === */}
      {telaAtual === "funcionarios" && (
        <View>
          <Text style={styles.subtitle}>Gerenciar Funcionários</Text>
          <TextInput style={styles.input} placeholder="Nome" value={nomeFunc} onChangeText={setNomeFunc} />
          <TextInput style={styles.input} placeholder="Email" value={emailFunc} onChangeText={setEmailFunc} />
          <TextInput style={styles.input} placeholder="Senha" value={senhaFunc} onChangeText={setSenhaFunc} secureTextEntry />
          <Button title="Salvar" onPress={salvarFuncionario} />
          <FlatList
            data={funcionarios}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text>{item.nome} - {item.email}</Text>
                <View style={styles.row}>
                  <Button title="Editar" onPress={() => {
                    setEditandoFuncId(item.id);
                    setNomeFunc(item.nome);
                    setEmailFunc(item.email);
                    setSenhaFunc(item.senha);
                  }} />
                  <Button title="Excluir" color="red" onPress={() => excluirFuncionario(item.id)} />
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* === ADMINS === */}
      {telaAtual === "admins" && (
        <View>
          <Text style={styles.subtitle}>Gerenciar Administradores</Text>
          <TextInput style={styles.input} placeholder="Nome" value={nomeAdm} onChangeText={setNomeAdm} />
          <TextInput style={styles.input} placeholder="Email" value={emailAdm} onChangeText={setEmailAdm} />
          <TextInput style={styles.input} placeholder="Senha" value={senhaAdm} onChangeText={setSenhaAdm} secureTextEntry />
          <Button title="Salvar" onPress={salvarAdm} />
          <FlatList
            data={admins}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text>{item.nome} - {item.email}</Text>
                <View style={styles.row}>
                  <Button title="Editar" onPress={() => {
                    setEditandoAdmId(item.id);
                    setNomeAdm(item.nome);
                    setEmailAdm(item.email);
                    setSenhaAdm(item.senha);
                  }} />
                  <Button title="Excluir" color="red" onPress={() => excluirAdm(item.id)} />
                </View>
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}