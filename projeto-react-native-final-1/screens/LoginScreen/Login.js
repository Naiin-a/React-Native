import React, { useState } from "react";
import { View, Text, TextInput, Button , TouchableOpacity, Image} from "react-native";
import { getDocuments } from "../../firestoreAPI";
import { adicionarRelatorio } from "../../relatorioAPI";
import AdmScreen from "../AdminScreen/AdmScreen";
import FuncionarioScreen from "../FuncionarioScreen/FuncScreen";
import styles from "../LoginScreen/styleApp";
import Toast from "react-native-toast-message";

export default function Login() {
  // Estados para controlar email, senha e usuário logado
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);

  // Função de login
  async function login() {
    // Se não preencher email ou senha, não faz nada
    if (!email || !senha) return;

    try {
      // Busca todos os admins e funcionários do Firestore
      const admins = await getDocuments("admins");
      const funcionarios = await getDocuments("usuarios");
      const todos = [...admins, ...funcionarios];

      // Procura o usuário que corresponde ao email e senha informados
      const userDoc = todos.find((doc) => {
        const f = doc.fields;
        return (
          f.email.stringValue.toLowerCase() === email.toLowerCase() &&
          f.senha.stringValue === senha
        );
      });

      if (userDoc) {
        // Se encontrou usuário, monta o objeto user
        const f = userDoc.fields;
        const user = {
          id: userDoc.name.split('/').pop(), // 🔹 adiciona o id do documento
          nome: f.nome.stringValue,
          email: f.email.stringValue,
          tipo: f.tipo?.stringValue || 'adm', // Default para adm se não existir
        };
        // Registra no relatório que o usuário fez login
        adicionarRelatorio(user, "fez login no sistema.");
        setLoggedUser(user); // Define usuário logado
      } else {
        // Se não encontrou usuário, mostra toast de erro
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Login ou senha incorreto!",
          position: "top",
          visibilityTime: 2000,
        });
      }
    } catch (e) {
      // Caso ocorra algum erro ao buscar dados
      console.log("Erro login:", e.message);
    }
  }

  // Função de logout
  function logout() {
    // Registra no relatório que o usuário saiu
    adicionarRelatorio(loggedUser, "saiu do sistema.");
    // Limpa estados
    setLoggedUser(null);
    setEmail("");
    setSenha("");
  }

  // Se não há usuário logado, mostra tela de login
  if (!loggedUser) {
    return (
      <View style={styles.container}>
        {/* COPYRIGHT */}
        <Text style={styles.copyText}>© 2025 Pomodoro. Todos os direitos reservados.</Text>

        {/* Logo */}
        <Image
          source={require("../../assets/pomodoro.png")} // Caminho da imagem
          style={styles.logo} // Estilo do logo
        />

        {/* Título */}
        <Text style={styles.title}>Login</Text>

        {/* Campo de email */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={styles.input}
        />

        {/* Campo de senha */}
        <TextInput
          placeholder="Senha"
          placeholderTextColor="#777"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={styles.input}
        />

        {/* Botão de login */}
        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Componente Toast */}
        <Toast />
      </View>
    );
  }

  // Redireciona para tela de admin se tipo do usuário for "adm"
  if (loggedUser.tipo === "adm") {
    return <AdmScreen user={loggedUser} onLogout={logout} />;
  }

  // Caso contrário, redireciona para tela de funcionário
  return <FuncionarioScreen user={loggedUser} onLogout={logout} />;
}
