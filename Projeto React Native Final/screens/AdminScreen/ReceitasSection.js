import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Animated } from "react-native";
import Toast from "react-native-toast-message";
import { adicionarRelatorio } from "../../relatorioAPI";
import styles from "./styleAdm";

export default function ReceitasSection({
  confirmarExclusao,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  user,
}) {
  const [receitas, setReceitas] = useState([]);
  const [novaReceitaNome, setNovaReceitaNome] = useState("");
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [receitaOriginal, setReceitaOriginal] = useState(null);
  const [editandoReceitaId, setEditandoReceitaId] = useState(null);
  const [estoque, setEstoque] = useState([]);
  const [mostrarItens, setMostrarItens] = useState(false); // 👈 controla abrir/fechar lista de itens

  async function carregarReceitas() {
    const docs = await getDocuments("receitas");
    if (!docs || docs.length === 0) {
      setReceitas([]);
      return;
    }

    const recs = docs.map((doc) => {
      const f = doc.fields;
      const itens = Array.isArray(f.itens?.arrayValue?.values)
        ? f.itens.arrayValue.values.map((v) => {
            const campos = v.mapValue?.fields || {};
            return {
              itemId: campos.itemId?.stringValue || "",
              quantidade: parseInt(campos.quantidade?.integerValue || "0"),
            };
          })
        : [];

      return {
        id: doc.name.split("/").pop(),
        nome: f.nome?.stringValue || "Sem nome",
        itens,
      };
    });

    recs.sort((a, b) => a.nome.localeCompare(b.nome));
    setReceitas(recs);
  }

  async function carregarEstoque() {
    const docs = await getDocuments("estoque");
    const itens = docs.map((doc) => {
      const f = doc.fields || {};
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome?.stringValue || "",
        quantidade: parseInt(f.quantidade?.integerValue || "0"),
      };
    });
    itens.sort((a, b) => a.nome.localeCompare(b.nome));
    setEstoque(itens);
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

    const dadosReceita = { nome: novaReceitaNome, itens: itensParaSalvar };

    if (editandoReceitaId) {
      await updateDocument("receitas", editandoReceitaId, dadosReceita);

      // todo o restante desse IF é referente ao relatório

      const ingredientesOriginais = {};

      for (const receitaItem of receitaOriginal.itens) {
        const estoqueItem = estoque.find((e) => e.id === receitaItem.itemId);
        ingredientesOriginais[estoqueItem.nome] = receitaItem.quantidade;
      }

      const ingredientesNovos = {};
      for (const receitaItem of dadosReceita.itens) {
        const estoqueItem = estoque.find((e) => e.id === receitaItem.itemId);
        ingredientesNovos[estoqueItem.nome] = receitaItem.quantidade;
      }

      // compara os ingredientes novos com os originais e registra as alterações
      const alteracoesDeIngredientes = [];
      for (const entry of Object.entries(ingredientesNovos)) {
        const nome = entry[0];
        const qtd = entry[1];
        // caso 1: ingrediente se manteve presente
        if (ingredientesOriginais[nome]) {
          if (ingredientesOriginais[nome] === ingredientesNovos[nome]) {continue;} // quantidades iguais

          alteracoesDeIngredientes.push(`- ${nome}: de ${ingredientesOriginais[nome]} para ${ingredientesNovos[nome]};`);
          delete ingredientesOriginais[nome];
        }
        // caso 2: ingrediente foi adicionado
        else if (!ingredientesOriginais[nome]) {
          alteracoesDeIngredientes.push(`- ${nome}: ${qtd} (novo ingrediente);`);
        }
      }
      // caso 3: ingrediente foi removido
      for (const entry of Object.entries(ingredientesOriginais)) {
        const nome = entry[0];
        const _qtd = entry[1];
        if (!ingredientesNovos[nome]) { // condição teoricamente redundante, mas botei só pra garantir
          alteracoesDeIngredientes.push(`- ${nome}: removido;`);
        }
      }

      const relatorio = alteracoesDeIngredientes.length === 0 ?
        `atualizou o nome da receita ${receitaOriginal.nome} para ${dadosReceita.nome}.` : `atualizou ingredientes da receita ${receitaOriginal.nome}` + (receitaOriginal.nome === dadosReceita.nome ? "" :
        ` (agora ${dadosReceita.nome})`) + `:\n${alteracoesDeIngredientes.join("\n")}`;
      adicionarRelatorio(user, relatorio);
    } else {
      await createDocument("receitas", dadosReceita);

      let relatorio = `adicionou receita ${dadosReceita.nome} com ingredientes:\n`
      for (const receitaItem of dadosReceita.itens) {
        const estoqueItem = estoque.find((e) => e.id === receitaItem.itemId);
        relatorio += `- ${estoqueItem.nome}: ${receitaItem.quantidade};\n`;
      }
      adicionarRelatorio(user, relatorio.trimEnd());
    }

    setNovaReceitaNome("");
    setItensSelecionados([]);
    setReceitaOriginal(null);
    setEditandoReceitaId(null);
    carregarReceitas();

    Toast.show({
      type: "success",
      text1: "Sucesso",
      text2: `Receita ${editandoReceitaId ? "atualizada" : "cadastrada"} com sucesso!`,
      position: "top",
      visibilityTime: 2000,
    });
  }

  async function excluirReceita(id, nome) {
    try {
      await deleteDocument("receitas", id);
      adicionarRelatorio(user, `excluiu receita ${nome}.`);
      carregarReceitas();
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
      adicionarRelatorio(user, `tentou excluir receita ${nome}, mas houve impedimento por erro do sistema.`);
    }
  }

  useEffect(() => {
    carregarReceitas();
    carregarEstoque();

    const deletar = (e) => {
      if (e.detail.tipo === "receita") excluirReceita(e.detail.id, e.detail.nome);
    };
    document.addEventListener("deleteItem", deletar);
    document.addEventListener("carregarTudo", carregarReceitas);
    return () => {
      document.removeEventListener("deleteItem", deletar);
      document.removeEventListener("carregarTudo", carregarReceitas);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Gerenciar Receitas</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome da receita"
        placeholderTextColor="#888"
        value={novaReceitaNome}
        onChangeText={setNovaReceitaNome}
      />

      {/* Botão de colapsar a lista */}
      <TouchableOpacity
        style={{
          marginTop: 10,
          backgroundColor: "#2B1E3F",
          borderRadius: 8,
          paddingVertical: 10,
          alignItems: "center",
        }}
        onPress={() => setMostrarItens(!mostrarItens)}
      >
        <Text style={{ color: "#E6D4FA", fontWeight: "bold" }}>
          {mostrarItens ? "Esconder Itens ▲" : "Mostrar Itens ▼"}
        </Text>
      </TouchableOpacity>

      {/* Lista colapsável */}
      {mostrarItens && (
        <View style={{ marginTop: 10 }}>
          <Text style={[styles.textinho, { marginBottom: 6 }]}>
            Selecionar Itens e Quantidades:
          </Text>

          {estoque.map((item) => {
            const selecionado = itensSelecionados.find((i) => i.itemId === item.id);
            return (
              <View
                key={item.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginVertical: 4,
                }}
              >
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => toggleItemSelecionado(item.id)}
                >
                  <Text
                    style={{
                      color: selecionado ? "#A569BD" : "#DDD",
                      fontWeight: selecionado ? "bold" : "normal",
                    }}
                  >
                    {item.nome}
                  </Text>
                </TouchableOpacity>

                {selecionado && (
                  <TextInput
                    style={[
                      styles.input,
                      { width: 60, marginVertical: 0, textAlign: "center" },
                    ]}
                    keyboardType="numeric"
                    value={selecionado.quantidade.toString()}
                    onChangeText={(txt) => {
                      const novaQtd = parseInt(txt) || 0;
                      setItensSelecionados((prev) =>
                        prev.map((i) =>
                          i.itemId === item.id
                            ? { ...i, quantidade: novaQtd }
                            : i
                        )
                      );
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Botão principal */}
      <TouchableOpacity style={styles.buttonPrimary} onPress={salvarReceita}>
        <Text style={styles.buttonText}>
          {editandoReceitaId ? "Atualizar Receita" : "Salvar Receita"}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.textinho, { marginTop: 16 }]}>Receitas cadastradas:</Text>

      <FlatList
        data={receitas}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold", color: "#FFF" }}>{item.nome}</Text>
              {item.itens.map((i) => {
                const estoqueItem = estoque.find((e) => e.id === i.itemId);
                return (
                  <Text key={i.itemId} style={{ fontSize: 12, color: "#BBB" }}>
                    • {estoqueItem ? estoqueItem.nome : "Item removido"}: {i.quantidade}
                  </Text>
                );
              })}
            </View>

            <View style={styles.buttonRow}>
  <TouchableOpacity
     style={styles.buttonEdit}
    onPress={() => {
      setReceitaOriginal(item);
      setEditandoReceitaId(item.id);
      setNovaReceitaNome(item.nome);
      setItensSelecionados(item.itens);
    }}
  >
    <Text style={styles.buttonText}>Editar</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.buttonDelete}
    onPress={() => confirmarExclusao(item.id, "receita", item.nome)}
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
