import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },

  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 10,
  },

  bold: {
    fontWeight: "bold",
    marginVertical: 5,
  },

  // 🔹 Botões personalizados para o painel do ADM
  buttonContainer: {
    marginVertical: 10,
    alignItems: "center",
  },

  admButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
    width: "80%",
  },

  admButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: "#ff3b30",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 5,
  },

  editButton: {
    backgroundColor: "#4cd964",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 5,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },

//Painelzin de confirmação
  modalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContent: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  width: '80%',
},
modalTitle: {
  fontWeight: 'bold',
  marginBottom: 10,
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
},
modalItemText: {
  fontSize: 14,
  marginVertical: 2,
},

});