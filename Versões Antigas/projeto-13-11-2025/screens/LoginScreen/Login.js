import React, { useState } from "react";
import { View, Text, TextInput, Button , TouchableOpacity} from "react-native";
import { getDocuments } from "../../firestoreAPI";
import { adicionarRelatorio } from "../../relatorioAPI";
import AdmScreen from "../AdminScreen/AdmScreen";
import FuncionarioScreen from "../FuncionarioScreen/FuncScreen";
import styles from "../LoginScreen/styleApp";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);

  async function login() {
    // isso tá aqui pra facilitar testes, dá pra apagar depois
    /*const funcionariofantasma = {
      id: "idfuncionario",
      nome: "Fantasma da Cozinha",
      email: "funcionariofantasma@email.com",
      tipo: "func",
    };
    const adminfantasma = {
      id: "idadmin",
      nome: "Fantasma Gerente",
      email: "adminfantasma@email.com",
      tipo: "adm",
    };
    const logarCom = adminfantasma;
    setLoggedUser(logarCom);
    adicionarRelatorio(logarCom, "fez login no sistema.");
    return;*/

    if (!email || !senha) return;

    try {
      const admins = await getDocuments("admins");
      const funcionarios = await getDocuments("usuarios");
      const todos = [...admins, ...funcionarios];

      const userDoc = todos.find((doc) => {
        const f = doc.fields;
        return (
          f.email.stringValue.toLowerCase() === email.toLowerCase() &&
          f.senha.stringValue === senha
        );
      });

      if (userDoc) {
        const f = userDoc.fields;
        const user = {
          id: userDoc.name.split('/').pop(), // 🔹 adiciona o id aqui
          nome: f.nome.stringValue,
          email: f.email.stringValue,
          tipo: f.tipo?.stringValue || 'adm',
        };
        adicionarRelatorio(user, "fez login no sistema.");
        setLoggedUser(user);
      } else {
        alert("Usuário ou senha inválidos!");
      }
    } catch (e) {
      console.log("Erro login:", e.message);
    }
  }

  function logout() {
    adicionarRelatorio(loggedUser, "saiu do sistema.");
    setLoggedUser(null);
    setEmail("");
    setSenha("");
  }

  if (!loggedUser) {
    return (
     <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#777"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Redireciona conforme o tipo
  if (loggedUser.tipo === "adm") {
    return <AdmScreen user={loggedUser} onLogout={logout} />;
  }

  return <FuncionarioScreen user={loggedUser} onLogout={logout} />;
}
