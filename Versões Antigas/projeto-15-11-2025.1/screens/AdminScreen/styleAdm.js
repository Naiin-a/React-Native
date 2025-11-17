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

  // ===== Listagem =====
  listItem: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,

    // Layout em coluna
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  // ===== Linha dos botões =====
  buttonRow: {
    flexDirection: "row",            // coloca os botões lado a lado
    justifyContent: "flex-start", // separa levemente os dois botões
    alignItems: "center",
    marginTop: 12,
    width: "100%",
                       // garante alinhamento na largura do card
  },

  // ===== Modal =====
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#2B1E3F",
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

  // ===== Logout =====
  logoutContainer: {
    marginVertical: 30, 
    marginBottom: 60, 
    alignItems: "center",
  },

  // ===== Iaput =====
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFF",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#444",
  },

  // ===== Texto vazio =====
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },

  // ===== Botões =====
  buttonEdit: {
    backgroundColor: "#2E86C1", // azul
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10, // espaçamento entre Editar e Excluir
  },

  buttonDelete: {
    backgroundColor: "#C0392B", // vermelho
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPrimary: {
    backgroundColor: "#884EA0",
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

  textinho: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
    copyText: {
  color: "#555",
  fontSize: 12,
  marginTop: 40,
  position: "absolute",
  bottom: 20,
  textAlign: "center",
},
});
