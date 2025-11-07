import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E0E", // fundo escuro
    paddingHorizontal: 20,
    paddingTop: 40,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    color: "#BBBBBB",
    textAlign: "center",
    marginBottom: 25,
  },

  // ===== Botões de navegação =====
  navButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginBottom: 25,
  },

  navButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 130,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },

  // ===== Listagem (para Estoque, Receitas, etc.) =====
  listItem: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  // ===== Modal de confirmação =====
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#2B1E3F", // lilás escuro
    borderRadius: 14,
    padding: 25,
    width: "90%",
    shadowColor: "#9B59B6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 8,
  },

  modalTitle: {
    color: "#E6D4FA",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  modalItemText: {
    color: "#D9CFF2",
    fontSize: 15,
    marginVertical: 2,
    textAlign: "center",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  // ===== Saída =====
  logoutContainer: {
    marginVertical: 30,
    alignItems: "center",
  },

  // ===== Campos de input (caso existam) =====
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#444",
  },

  // ===== Texto de aviso ou vazio =====
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  buttonEdit: {
  backgroundColor: "#2E86C1", // azul mais escuro que o antigo
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
},

buttonDelete: {
  backgroundColor: "#C0392B", // vermelho escuro elegante
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
},
buttonPrimary: {
  backgroundColor: "#884EA0", // lilás padrão do tema
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginVertical: 10,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 3 },
  shadowRadius: 4,
  elevation: 5,
},
textinho:{
  color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center"
},



});
