import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0E0E", // fundo bem escuro
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

  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
  },

  listItem: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
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

  buttonPrimary: {
    backgroundColor: "#3498DB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 25,
    width: "90%",
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  modalItemText: {
    color: "#DDD",
    fontSize: 14,
    marginVertical: 2,
  },

  scrollContent: {
    paddingVertical: 20,
  },

  logoutContainer: {
    marginVertical: 30, 
    marginBottom: 60, 
    alignItems: "center",
  },


  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  navButtonsRow: {
  flexDirection: "row",
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
  minWidth: 120,
},
recipeTitle: {
  fontWeight: "bold",
  color: "#FFF",
  fontSize: 16,
  marginBottom: 4,
},

recipeItemText: {
  color: "#AAA",
  fontSize: 13,
},

makeButton: {
  backgroundColor: "#3498DB",
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 15,
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
  marginLeft: 10,
},

makeButtonText: {
  color: "#FFF",
  fontWeight: "bold",
  fontSize: 14,
},

insufficientText: {
  color: "#E74C3C",
  fontWeight: "bold",
  alignSelf: "center",
},


  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButton: {
    backgroundColor: "#444", // cinza escuro
  },

  confirmButton: {
    backgroundColor: "#7D3C98", // lilás escuro para contraste
  },

  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
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
