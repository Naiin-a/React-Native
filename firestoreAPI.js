// =============================
// 🔥 Firestore REST API Helper
// =============================

const FIREBASE_PROJECT_ID = "app-estoque-32d94";

function getFirestoreUrl(collection, documentId = "") {
  let url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}`;
  if (documentId) url += `/${documentId}`;
  return url;
}

// 🔹 Converte objeto JS → formato Firestore
export function convertToFirestoreFormat(data) {
  const result = {};
  for (const key in data) {
    const value = data[key];
    if (typeof value === "string") result[key] = { stringValue: value };
    else if (typeof value === "number")
      result[key] = { integerValue: value.toString() };
    else if (typeof value === "boolean") result[key] = { booleanValue: value };
  }
  return result;
}

// 🔹 Pega todos os documentos de uma coleção
export async function getDocuments(collection) {
  const res = await fetch(getFirestoreUrl(collection));
  const json = await res.json();
  return json.documents || [];
}

// 🔹 Cria novo documento
export async function createDocument(collection, data) {
  const res = await fetch(getFirestoreUrl(collection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: convertToFirestoreFormat(data) }),
  });

  if (!res.ok) throw new Error("Erro ao criar documento");
  return await res.json();
}

// 🔹 Atualiza documento (aceita múltiplos campos)
export async function updateDocument(collection, documentId, data) {
  const queryParams = Object.keys(data)
    .map((key) => `updateMask.fieldPaths=${key}`)
    .join("&");

  const res = await fetch(
    `${getFirestoreUrl(collection, documentId)}?${queryParams}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: convertToFirestoreFormat(data) }),
    }
  );

  if (!res.ok) throw new Error("Erro ao atualizar documento");
  return await res.json();
}

// 🔹 Deleta documento
export async function deleteDocument(collection, documentId) {
  const res = await fetch(getFirestoreUrl(collection, documentId), {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Erro ao excluir documento");
  return true;
}

// 🔹 Busca documento pelo nome
export async function findDocumentByName(collection, nome) {
  const docs = await getDocuments(collection);
  if (!docs || docs.length === 0) return null;

  const docEncontrado = docs.find((doc) => {
    const f = doc.fields;
    return f?.nome?.stringValue?.toLowerCase() === nome.toLowerCase();
  });

  if (!docEncontrado) return null;

  return {
    id: docEncontrado.name.split("/").pop(),
    fields: docEncontrado.fields,
  };
}
