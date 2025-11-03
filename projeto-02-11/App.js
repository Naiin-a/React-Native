import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { getDocuments } from "./firestoreAPI";
import AdmScreen from "./AdmScreen";
import FuncionarioScreen from "./FuncionarioScreen";
import styles from "./styles";

export default function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);

  async function login() {
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
        setLoggedUser({
          nome: f.nome.stringValue,
          email: f.email.stringValue,
          tipo: f.tipo.stringValue,
        });
      } else {
        alert("Usuário ou senha inválidos!");
      }
    } catch (e) {
      console.log("Erro login:", e.message);
    }
  }

  function logout() {
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
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={styles.input}
        />
        <Button title="Entrar" onPress={login} />
      </View>
    );
  }

  // Redireciona conforme o tipo
  if (loggedUser.tipo === "adm") {
    return <AdmScreen user={loggedUser} onLogout={logout} />;
  }

  return <FuncionarioScreen user={loggedUser} onLogout={logout} />;
}
