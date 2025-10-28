import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";

import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentByName,
} from "./firestoreAPI";

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);

  // Estoque
  const [estoque, setEstoque] = useState([]);
  const [novoNome, setNovoNome] = useState("");
  const [novaQuantidade, setNovaQuantidade] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  // Receitas
  const [receitas, setReceitas] = useState([]);
  const [novaReceitaNome, setNovaReceitaNome] = useState("");
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [editandoReceitaId, setEditandoReceitaId] = useState(null);

  // Tela atual: 'itens' ou 'receitas'
  const [telaAtual, setTelaAtual] = useState("itens");

  // =============================
  // 🔹 LOGIN
  // =============================
  async function login() {
    if (!email || !senha) return;

    try {
      const admins = await getDocuments("admins");
      const usuarios = await getDocuments("usuarios");
      const todos = [...admins, ...usuarios];

      const userDoc = todos.find((doc) => {
        const f = doc.fields;
        return (
          f.email.stringValue.toLowerCase() === email.toLowerCase() &&
          f.senha.stringValue === senha
        );
      });

      if (userDoc) {
        const f = userDoc.fields;
        setLoggedUser({
          nome: f.nome.stringValue,
          email: f.email.stringValue,
          tipo: f.tipo.stringValue,
        });
        carregarEstoque();
        carregarReceitas();
      }
    } catch (e) {
      console.log("Erro login:", e.message);
    }
  }

  // =============================
  // 🔹 ESTOQUE
  // =============================
  async function carregarEstoque() {
    const docs = await getDocuments("estoque");
    const itens = docs.map((doc) => {
      const fields = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: fields.nome.stringValue,
        quantidade: parseInt(fields.quantidade.integerValue),
      };
    });
    itens.sort((a, b) => a.nome.localeCompare(b.nome));
    setEstoque(itens);
  }

  async function adicionarOuAtualizarItem() {
    if (loggedUser?.tipo !== "adm") return;
    if (!novoNome || !novaQuantidade) return;

    const qtd = parseInt(novaQuantidade);
    if (isNaN(qtd) || qtd < 0) return;

    try {
      if (editandoId) {
        await updateDocument("estoque", editandoId, { nome: novoNome, quantidade: qtd });
        setEditandoId(null);
      } else {
        const docExistente = await findDocumentByName("estoque", novoNome);
        if (docExistente) {
          const id = docExistente.id;
          const atual = parseInt(docExistente.fields.quantidade.integerValue);
          await updateDocument("estoque", id, { quantidade: atual + qtd });
        } else {
          await createDocument("estoque", { nome: novoNome, quantidade: qtd });
        }
      }
      setNovoNome("");
      setNovaQuantidade("");
      carregarEstoque();
    } catch (e) {
      console.log("Erro item:", e.message);
    }
  }

  function editarItem(item) {
    setNovoNome(item.nome);
    setNovaQuantidade(item.quantidade.toString());
    setEditandoId(item.id);
  }

  function excluirItemComConfirmacao(id) {
    alert(
      "Confirmação",
      "Deseja realmente excluir este item?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => excluirItem(id) }
      ]
    );
  }

  async function excluirItem(id) {
    await deleteDocument("estoque", id);
    carregarEstoque();
  }

  async function retirarItem(id) {
    if (loggedUser?.tipo !== "usuario") return;

    const item = estoque.find((i) => i.id === id);
    if (!item || item.quantidade <= 0) return;

    await updateDocument("estoque", id, { quantidade: item.quantidade - 1 });
    carregarEstoque();
  }

  // =============================
  // 🔹 RECEITAS
  // =============================
  async function carregarReceitas() {
    const docs = await getDocuments("receitas");
    const recs = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome.stringValue,
        itens: f.itens?.arrayValue?.values?.map(v => ({
          itemId: v.mapValue.fields.itemId.stringValue,
          quantidade: parseInt(v.mapValue.fields.quantidade.integerValue)
        })) || [],
      };
    });
    setReceitas(recs);
  }

  function toggleItemSelecionado(itemId) {
    setItensSelecionados(prev => {
      if (prev.some(i => i.itemId === itemId)) {
        return prev.filter(i => i.itemId !== itemId);
      }
      return [...prev, { itemId, quantidade: 1 }];
    });
  }

  function mudarQuantidadeItemSelecionado(itemId, qtd) {
    setItensSelecionados(prev => prev.map(i => i.itemId === itemId ? { ...i, quantidade: qtd } : i));
  }

  async function adicionarOuAtualizarReceita() {
    if (!novaReceitaNome || itensSelecionados.length === 0) return;

    try {
      const itensParaSalvar = itensSelecionados.map(i => ({ itemId: i.itemId, quantidade: i.quantidade }));

      if (editandoReceitaId) {
        await updateDocument("receitas", editandoReceitaId, {
          nome: novaReceitaNome,
          itens: itensParaSalvar,
        });
        setEditandoReceitaId(null);
      } else {
        await createDocument("receitas", {
          nome: novaReceitaNome,
          itens: itensParaSalvar,
        });
      }

      // Atualiza localmente para aparecer imediatamente
      const novaReceita = {
        id: editandoReceitaId || "temp-" + Date.now(),
        nome: novaReceitaNome,
        itens: itensParaSalvar,
      };
      setReceitas(prev => {
        if (editandoReceitaId) {
          return prev.map(r => r.id === editandoReceitaId ? novaReceita : r);
        }
        return [...prev, novaReceita];
      });

      setNovaReceitaNome("");
      setItensSelecionados([]);
      carregarReceitas(); //garante sincronização com Firestore
    } catch (e) {
      console.log("Erro receita:", e.message);
    }
  }

  function editarReceita(rec) {
    setNovaReceitaNome(rec.nome);
    setItensSelecionados(rec.itens);
    setEditandoReceitaId(rec.id);
  }

  function excluirReceitaComConfirmacao(id) {
    alert(
      "Confirmação",
      "Deseja realmente excluir esta receita?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => excluirReceita(id) }
      ]
    );
  }

  async function excluirReceita(id) {
    await deleteDocument("receitas", id);
    carregarReceitas();
  }

  async function usarReceita(rec) {
    for (let i of rec.itens) {
      const item = estoque.find(it => it.id === i.itemId);
      if (!item || item.quantidade < i.quantidade) return;
    }
    for (let i of rec.itens) {
      const item = estoque.find(it => it.id === i.itemId);
      await updateDocument("estoque", item.id, { quantidade: item.quantidade - i.quantidade });
    }
    carregarEstoque();
  }

  function logout() {
    setLoggedUser(null);
    setEmail("");
    setSenha("");
    setEstoque([]);
    setReceitas([]);
    setTelaAtual("itens");
  }

  // =============================
  // 🔹 TELAS
  // =============================
  if (!loggedUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 26, marginBottom: 20, textAlign: "center" }}>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 }}
        />
        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 20, borderRadius: 5 }}
        />
        <Button title="Entrar" onPress={login} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Olá, {loggedUser.nome} ({loggedUser.tipo})
      </Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <Button title="Itens" onPress={() => setTelaAtual("itens")} />
        <Button title="Receitas" onPress={() => setTelaAtual("receitas")} />
        <Button title="Sair" onPress={logout} color="red" />
      </View>

      {telaAtual === "itens" && (
        <View style={{ flex: 1 }}>
          {loggedUser.tipo === "adm" && (
            <View style={{ marginVertical: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                {editandoId ? "Editar Item" : "Novo Item"}
              </Text>
              <TextInput
                placeholder="Nome do item"
                value={novoNome}
                onChangeText={setNovoNome}
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 4, marginBottom: 10 }}
              />
              <TextInput
                placeholder="Quantidade"
                value={novaQuantidade}
                onChangeText={setNovaQuantidade}
                keyboardType="numeric"
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 4, marginBottom: 10 }}
              />
              <Button
                title={editandoId ? "Salvar Alterações" : "Adicionar/Atualizar Item"}
                onPress={adicionarOuAtualizarItem}
              />
            </View>
          )}

          <FlatList
            data={estoque}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ddd", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text>{item.nome} - Quantidade: {item.quantidade}</Text>
                {loggedUser.tipo === "adm" ? (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity onPress={() => editarItem(item)}><Text style={{ color: "blue" }}>🖊️</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => excluirItemComConfirmacao(item.id)}><Text style={{ color: "red" }}>🗑️</Text></TouchableOpacity>
                  </View>
                ) : (
                  item.quantidade > 0 && <Button title="Retirar 1" onPress={() => retirarItem(item.id)} />
                )}
              </View>
            )}
          />
        </View>
      )}

      {telaAtual === "receitas" && (
        <ScrollView style={{ flex: 1 }}>
          {loggedUser.tipo === "adm" && (
            <View style={{ marginVertical: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                {editandoReceitaId ? "Editar Receita" : "Nova Receita"}
              </Text>
              <TextInput
                placeholder="Nome da receita"
                value={novaReceitaNome}
                onChangeText={setNovaReceitaNome}
                style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 4, marginBottom: 10 }}
              />
              <Text style={{ fontWeight: "bold" }}>Selecionar itens:</Text>
              {estoque.map((item) => {
                const sel = itensSelecionados.find(i => i.itemId === item.id);
                return (
                  <View key={item.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                    <TouchableOpacity onPress={() => toggleItemSelecionado(item.id)}>
                      <Text style={{ color: sel ? "green" : "black" }}>{sel ? "✔️" : "⬜"} {item.nome}</Text>
                    </TouchableOpacity>
                    {sel && (
                      <TextInput
                        value={sel.quantidade.toString()}
                        keyboardType="numeric"
                        onChangeText={(q) => {
                          const num = parseInt(q);
                          if (!isNaN(num) && num > 0) mudarQuantidadeItemSelecionado(item.id, num);
                        }}
                        style={{ borderWidth: 1, borderColor: "#ccc", width: 50, marginLeft: 10, padding: 4, borderRadius: 4 }}
                      />
                    )}
                  </View>
                );
              })}
              <Button
                title={editandoReceitaId ? "Salvar Alterações" : "Adicionar Receita"}
                onPress={adicionarOuAtualizarReceita}
              />
            </View>
          )}

          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Receitas:</Text>
          {receitas.map((rec) => (
            <View key={rec.id} style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
              <Text>{rec.nome}</Text>
              <Text>Itens:</Text>
              {rec.itens.map(i => {
                const item = estoque.find(it => it.id === i.itemId);
                return <Text key={i.itemId}>- {item?.nome || "?"} x {i.quantidade}</Text>;
              })}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
                {loggedUser.tipo === "adm" && (
                  <>
                    <Button title="Editar" onPress={() => editarReceita(rec)} />
                    <Button title="Excluir" color="red" onPress={() => excluirReceitaComConfirmacao(rec.id)} />
                  </>
                )}
                <Button title="Usar" onPress={() => usarReceita(rec)} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
