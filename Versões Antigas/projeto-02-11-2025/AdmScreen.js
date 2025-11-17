import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { Dimensions } from 'react-native';

import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  findDocumentByName,
} from './firestoreAPI';
import styles from './styles';




export default function AdmScreen({ user, onLogout }) {
  const [telaAtual, setTelaAtual] = useState('estoque');

const { height } = Dimensions.get('window');
const [modalVisivel, setModalVisivel] = useState(false);
const [itemParaExcluir, setItemParaExcluir] = useState(null);
const [tipoItem, setTipoItem] = useState(''); // 'estoque', 'receita', 'funcionario', 'adm'
const [itemParaExcluirNome, setItemParaExcluirNome] = useState('');


  // === EXCLUSÃO ===
function confirmarExclusao(id, tipo, nome) {
  setItemParaExcluir(id);
  setTipoItem(tipo);
  setItemParaExcluirNome(nome); // guarda o nome para mostrar no modal
  setModalVisivel(true);
}

async function confirmarExcluir() {
  if (!itemParaExcluir) return;

  switch (tipoItem) {
    case 'estoque':
      await excluirItem(itemParaExcluir);
      break;
    case 'receita':
      await excluirReceita(itemParaExcluir);
      break;
    case 'funcionario':
      await excluirFuncionario(itemParaExcluir);
      break;
    case 'adm':
      await excluirAdm(itemParaExcluir);
      break;
    default:
      break;
  }

  setModalVisivel(false);
  setItemParaExcluir(null);
  setTipoItem('');
}




  // === ESTOQUE ===
  const [estoque, setEstoque] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [editandoId, setEditandoId] = useState(null);

async function carregarEstoque() {
  try {
    const docs = await getDocuments("estoque");

    const itens = docs.map((doc) => {
      const f = doc.fields || {};
      const quantidade = f.quantidade?.integerValue || '0';
      return {
        id: doc.name.split("/").pop(),
        nome: f.nome?.stringValue || 'Sem nome',
        quantidade: parseInt(quantidade),
      };
    });

    // Ordena por nome para facilitar visualização
    itens.sort((a, b) => a.nome.localeCompare(b.nome));

    setEstoque(itens);
  } catch (error) {
    console.error("Erro ao carregar estoque:", error);
    setEstoque([]); // garante que o estado não fique indefinido
    Toast.show({
    type: 'error',
    text1: 'Erro',
    text2: 'Não foi possível carregar o estoque.',
    position: 'top',        // usamos 'top' para poder usar topOffset
  topOffset: height / 2,  // coloca o toast no meio da tela
  });
  } 
}


  async function salvarItem() {
    if (!novoNome || !novaQuantidade) return;
    const qtd = parseInt(novaQuantidade);
    if (isNaN(qtd) || qtd < 0) return;

    if (editandoId) {
      await updateDocument('estoque', editandoId, {
        nome: novoNome,
        quantidade: qtd,
      });
    Toast.show({
    type: 'success',
    text1: 'Item atualizado',
    text2: `"${novoNome}" foi atualizado com sucesso!`,
    position: 'top',        // usamos 'top' para poder usar topOffset
    topOffset: height / 2   // coloca o toast no meio da tela
  });
    } else {
      const existente = await findDocumentByName('estoque', novoNome);
      if (existente) {
        const id = existente.id;
        const atual = parseInt(existente.fields.quantidade.integerValue);
        await updateDocument('estoque', id, { quantidade: atual + qtd });
      Toast.show({
      type: 'success',
      text1: 'Quantidade atualizada',
      text2: `"${novoNome}" teve a quantidade incrementada!`,
      position: 'top',        // usamos 'top' para poder usar topOffset
      topOffset: height / 2,  // coloca o toast no meio da tela
    });
      } else {
        await createDocument('estoque', { nome: novoNome, quantidade: qtd });
      Toast.show({
      type: 'success',
      text1: 'Item criado',
      text2: `"${novoNome}" foi adicionado ao estoque!`,
      position: 'bottom',
    });
      }
    }
    setNovoNome('');
    setNovaQuantidade('');
    setEditandoId(null);
    carregarEstoque();
  }

 // Função de exclusão real
async function excluirItem(id) {
  try {
    await deleteDocument('estoque', id);
    carregarEstoque();
    Toast.show({
    type: 'success',
    text1: 'Item excluído',
    text2: `"${itemParaExcluirNome}" foi removido do estoque.`,
    position: 'bottom',
  });
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    Toast.show({
    type: 'error',
    text1: 'Erro',
    text2: 'Não foi possível excluir o item.',
    position: 'bottom',
  });
  }
}


  // === RECEITAS ===
  const [receitas, setReceitas] = useState([]);
  const [novaReceitaNome, setNovaReceitaNome] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState([]);
  const [editandoReceitaId, setEditandoReceitaId] = useState(null);

  async function carregarReceitas() {
    const docs = await getDocuments('receitas');
    if (!docs || docs.length === 0) {
      setReceitas([]);
      return;
    }

    const recs = docs.map((doc) => {
      const f = doc.fields;

      // Extrai os itens de forma segura
      const itens =
        f.itens?.arrayValue?.values?.map((v) => {
          const campos = v.mapValue?.fields || {};
          return {
            itemId: campos.itemId?.stringValue || '',
            quantidade: parseInt(campos.quantidade?.integerValue || '0'),
          };
        }) || [];

      return {
        id: doc.name.split('/').pop(),
        nome: f.nome?.stringValue || 'Sem nome',
        itens,
      };
    });

    recs.sort((a, b) => a.nome.localeCompare(b.nome));
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

    const dadosReceita = {
      nome: novaReceitaNome,
      itens: itensParaSalvar,
    };

    if (editandoReceitaId) {
      await updateDocument('receitas', editandoReceitaId, dadosReceita);
    } else {
      await createDocument('receitas', dadosReceita);
    }

    setNovaReceitaNome('');
    setItensSelecionados([]);
    setEditandoReceitaId(null);
    carregarReceitas();
  }

 async function excluirReceita(id) {
  try {
    await deleteDocument('receitas', id);
    carregarReceitas();
  } catch (error) {
    console.error("Erro ao excluir receita:", error);
  }
}


  // === FUNCIONÁRIOS ===
  const [funcionarios, setFuncionarios] = useState([]);
  const [nomeFunc, setNomeFunc] = useState('');
  const [emailFunc, setEmailFunc] = useState('');
  const [senhaFunc, setSenhaFunc] = useState('');
  const [tipoFunc, setTipoFunc] = useState('');
  const [editandoFuncId, setEditandoFuncId] = useState(null);

  async function carregarFuncionarios() {
    const docs = await getDocuments('usuarios');
    const lista = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split('/').pop(),
        nome: f.nome.stringValue,
        email: f.email.stringValue,
        senha: f.senha.stringValue,
        tipo: f.tipo?.stringValue || '',
      };
    });
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
    setFuncionarios(lista);
  }

  async function salvarFuncionario() {
    if (!nomeFunc || !emailFunc || !senhaFunc) return;
    const dados = {
      nome: nomeFunc,
      email: emailFunc,
      senha: senhaFunc,
      tipo: tipoFunc || 'funcionario',
    };

    if (editandoFuncId) {
      await updateDocument('usuarios', editandoFuncId, dados);
    } else {
      await createDocument('usuarios', dados);
    }
    setNomeFunc('');
    setEmailFunc('');
    setSenhaFunc('');
    setTipoFunc('');
    setEditandoFuncId(null);
    carregarFuncionarios();
  }

  async function excluirFuncionario(id) {
  try {
    await deleteDocument('usuarios', id);
    carregarFuncionarios();
  } catch (error) {
    console.error("Erro ao excluir funcionário:", error);
  }
}


  // === ADMINS ===
  const [admins, setAdmins] = useState([]);
  const [nomeAdm, setNomeAdm] = useState('');
  const [emailAdm, setEmailAdm] = useState('');
  const [senhaAdm, setSenhaAdm] = useState('');
  const [tipoAdm, setTipoAdm] = useState('');
  const [editandoAdmId, setEditandoAdmId] = useState(null);

  async function carregarAdmins() {
    const docs = await getDocuments('admins');
    const lista = docs.map((doc) => {
      const f = doc.fields;
      return {
        id: doc.name.split('/').pop(),
        nome: f.nome.stringValue,
        email: f.email.stringValue,
        senha: f.senha.stringValue,
        tipo: f.tipo?.stringValue || 'adm',
      };
    });
    lista.sort((a, b) => a.nome.localeCompare(b.nome));
    setAdmins(lista);
  }

  async function salvarAdm() {
    if (!nomeAdm || !emailAdm || !senhaAdm) return;
    const dados = {
      nome: nomeAdm,
      email: emailAdm,
      senha: senhaAdm,
      tipo: tipoAdm || 'adm',
    };

    if (editandoAdmId) {
      await updateDocument('admins', editandoAdmId, dados);
    } else {
      await createDocument('admins', dados);
    }
    setNomeAdm('');
    setEmailAdm('');
    setSenhaAdm('');
    setTipoAdm('');
    setEditandoAdmId(null);
    carregarAdmins();
  }

    async function excluirAdm(id) {
  try {
    await deleteDocument('admins', id);
    carregarAdmins();
  } catch (error) {
    console.error("Erro ao excluir adm:", error);
  }
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
        <Button title="Estoque" onPress={() => setTelaAtual('estoque')} />
        <Button title="Receitas" onPress={() => setTelaAtual('receitas')} />
        <Button
          title="Funcionários"
          onPress={() => setTelaAtual('funcionarios')}
        />
        <Button title="Admins" onPress={() => setTelaAtual('admins')} />
        <Button title="Sair" color="red" onPress={onLogout} />
      </View>

      {/* === ESTOQUE === */}
      {telaAtual === 'estoque' && (
        <View>
          <Text style={styles.subtitle}>Gerenciar Estoque</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do item"
            value={novoNome}
            onChangeText={setNovoNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            keyboardType="numeric"
            value={novaQuantidade}
            onChangeText={setNovaQuantidade}
          />
          <Button title="Salvar" onPress={salvarItem} />
          <FlatList
            data={estoque}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text>
                  {item.nome} - {item.quantidade}
                </Text>
                <View style={styles.row}>
                  <Button
                    title="Editar"
                    onPress={() => {
                      setEditandoId(item.id);
                      setNovoNome(item.nome);
                      setNovaQuantidade(item.quantidade.toString());
                    }}
                  />
                  <Button
                    title="Excluir"
                    color="red"
                    onPress={() => confirmarExclusao(item.id, 'estoque',item.nome)}
                  />
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

    <TextInput
      style={styles.input}
      placeholder="Nome da receita"
      value={novaReceitaNome}
      onChangeText={setNovaReceitaNome}
    />

    <Text style={styles.bold}>Selecionar Itens e Quantidades:</Text>

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
            onPress={() => {
              if (selecionado) {
                // desmarcar item
                setItensSelecionados((prev) =>
                  prev.filter((i) => i.itemId !== item.id)
                );
              } else {
                // marcar item com quantidade 1 padrão
                setItensSelecionados((prev) => [
                  ...prev,
                  { itemId: item.id, quantidade: 1 },
                ]);
              }
            }}
          >
            <Text
              style={{
                color: selecionado ? "green" : "black",
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

    <Button
      title={editandoReceitaId ? "Atualizar Receita" : "Salvar Receita"}
      onPress={salvarReceita}
    />

    <Text style={[styles.bold, { marginTop: 16 }]}>Receitas cadastradas:</Text>
<FlatList
  data={receitas}
  keyExtractor={(r) => r.id}
  renderItem={({ item }) => (
    <View style={styles.listItem}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "bold" }}>{item.nome}</Text>

        {/* Lista dos ingredientes da receita */}
        {item.itens.map((i) => {
          const estoqueItem = estoque.find((e) => e.id === i.itemId);
          return (
            <Text key={i.itemId} style={{ fontSize: 12, color: "#555" }}>
              • {estoqueItem ? estoqueItem.nome : "Item removido"}: {i.quantidade}
            </Text>
          );
        })}
      </View>

      <View style={styles.row}>
        <Button
          title="Editar"
          onPress={() => {
            setEditandoReceitaId(item.id);
            setNovaReceitaNome(item.nome);
            setItensSelecionados(item.itens);
          }}
        />
        <Button
          title="Excluir"
          color="red"
          onPress={() => confirmarExclusao(item.id, 'receita', item.nome)}
        />
      </View>
    </View>
  )}
/>


  </View>
)}


      {/* === FUNCIONÁRIOS === */}
      {telaAtual === 'funcionarios' && (
        <View>
          <Text style={styles.subtitle}>Gerenciar Funcionários</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nomeFunc}
            onChangeText={setNomeFunc}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={emailFunc}
            onChangeText={setEmailFunc}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senhaFunc}
            onChangeText={setSenhaFunc}
            secureTextEntry
          />
          <Button title="Salvar" onPress={salvarFuncionario} />
          <FlatList
            data={funcionarios}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text>
                  {item.nome} - {item.email}
                </Text>
                <View style={styles.row}>
                  <Button
                    title="Editar"
                    onPress={() => {
                      setEditandoFuncId(item.id);
                      setNomeFunc(item.nome);
                      setEmailFunc(item.email);
                      setSenhaFunc(item.senha);
                    }}
                  />
                  <Button
                    title="Excluir"
                    color="red"
                    onPress={() => confirmarExclusao(item.id, 'funcionario', item.nome)}
                  />
                </View>
              </View>
            )}
          />
        </View>
      )}

      {/* === ADMINS === */}
      {telaAtual === 'admins' && (
        <View>
          <Text style={styles.subtitle}>Gerenciar Administradores</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nomeAdm}
            onChangeText={setNomeAdm}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={emailAdm}
            onChangeText={setEmailAdm}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senhaAdm}
            onChangeText={setSenhaAdm}
            secureTextEntry
          />
          <Button title="Salvar" onPress={salvarAdm} />
          <FlatList
            data={admins}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text>
                  {item.nome} - {item.email}
                </Text>
                <View style={styles.row}>
                  <Button
                    title="Editar"
                    onPress={() => {
                      setEditandoAdmId(item.id);
                      setNomeAdm(item.nome);
                      setEmailAdm(item.email);
                      setSenhaAdm(item.senha);
                    }}
                  />
                  <Button
                    title="Excluir"
                    color="red"
                    onPress={() => confirmarExclusao(item.id, 'adm', item.nome)}
                  />
                </View>
              </View>
            )}
          />
        </View>
      )}
<Modal
  transparent={true}
  visible={modalVisivel}
  animationType="fade"
  onRequestClose={() => setModalVisivel(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        Tem certeza que quer excluir "{itemParaExcluirNome}"?
      </Text>
      <View style={styles.modalButtons}>
        <Button title="Cancelar" onPress={() => setModalVisivel(false)} />
        <View style={{ width: 10 }} />
        <Button title="Excluir" color="red" onPress={confirmarExcluir} />
      </View>
    </View>
  </View>
</Modal>

{/* Toast global */}
      <Toast />

    </ScrollView>
  );
}
