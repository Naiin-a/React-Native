import React, { useState } from "react";
import { View, Text, TextInput, Button , TouchableOpacity} from "react-native";
import { getDocuments } from "../../firestoreAPI";
import AdmScreen from "../AdminScreen/AdmScreen";
import FuncionarioScreen from "../FuncionarioScreen/FuncScreen";
import styles from "../LoginScreen/styleApp";

export default function Login() {
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
      id: userDoc.name.split('/').pop(), // 🔹 adiciona o id aqui
      nome: f.nome.stringValue,
      email: f.email.stringValue,
      tipo: f.tipo?.stringValue || 'adm',
    });
  } else {
    alert("Usuário ou senha inválidos!");
  }
} catch (e) {
  console.log("Erro login:", e.message);
}}

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
