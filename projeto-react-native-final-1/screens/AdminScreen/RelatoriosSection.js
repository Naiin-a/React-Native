import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { adicionarRelatorio, pegarRelatorios } from "../../relatorioAPI";
import styles from "./styleAdm";

export default function RelatoriosSection({
  confirmarExclusao,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  user,
}) {

  const [filtroNome, setFiltroNome] = useState("");

  // regexes pra melhorar a filtragem, substituindo acentos e certos caracteres especiais por suas versões simples (ã → a, ç → c)
  const formatarNome = nome => nome.toLowerCase().replace(/\s/g, "").replace(/[áàãâä]/g, "a").replace(/[éèẽêë]/g, "e").replace(/[íìĩîï]/g, "i").replace(/[óòõôö]/g, "o").replace(/[úùũûü]/g, "u").replace(/ç/g, "c").replace(/ñ/g, "n").replace(/[^a-z0-9]/g, "");

  const relatorios = pegarRelatorios();
  const renderRelatorio = ({item}) => {
    //console.log("filtroNome:", filtroNome, "item.nome:", item.nome);

    // filtro simples por nome
    if (filtroNome && !formatarNome(item.nome).includes(formatarNome(filtroNome))) {return;}

    return (
      <View style={styles.listItem}>
      <Text style={{ color: "#BBB", fontSize: 12 }}>{(new Date(item.timestamp)).toLocaleString("pt-br")}</Text>
      <Text style={{ color: "#FFF", fontWeight: "bold" }}><Text style={item.admin ? { color: "#1DD7E9" } : { color: "#1DE931"}}>{item.admin ? "Admin " : "Funcionário(a) "}<Text style={{ textDecoration: "underline" }}>{item.nome}</Text></Text><Text>{" " + item.texto}</Text></Text>
      </View>
    );
  }

  // o componente em si
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Visualizar Relatórios</Text>

      <TextInput
        style={styles.input}
        placeholder="Filtrar por nome de pessoa"
        placeholderTextColor="#888"
        value={filtroNome}
        onChangeText={setFiltroNome}
      />

      <FlatList
        data={relatorios}
        renderItem={renderRelatorio}
      />
    </View>
  );
}
