// ============================= 
// 🔥 Firestore REST API Helper
// =============================

// ID do projeto Firebase
const FIREBASE_PROJECT_ID = "app-estoque-32d94";

// 🔹 Monta a URL da API do Firestore para uma coleção ou documento específico
function getFirestoreUrl(collection, documentId = "") {
  // URL base da coleção
  let url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}`;
  
  // Se passar o documentId, adiciona à URL para acessar documento específico
  if (documentId) url += `/${documentId}`;
  
  return url;
}

// =============================
// 🔹 Converte objeto JS → formato Firestore
// =============================
export function convertToFirestoreFormat(data) {
  const result = {};
  
  // Itera sobre cada chave do objeto
  for (const key in data) {
    const value = data[key];

    // Strings → stringValue
    if (typeof value === "string") {
      result[key] = { stringValue: value };
    
    // Números → integerValue (convertido para string, como o Firestore exige)
    } else if (typeof value === "number") {
      result[key] = { integerValue: value.toString() };
    
    // Boolean → booleanValue
    } else if (typeof value === "boolean") {
      result[key] = { booleanValue: value };
    
    // Array → arrayValue com mapeamento recursivo
    } else if (Array.isArray(value)) {
      result[key] = {
        arrayValue: {
          values: value.map((v) => ({
            mapValue: { fields: convertToFirestoreFormat(v) }, // chama recursivamente
          })),
        },
      };
    
    // Objetos → mapValue com fields (recursivo)
    } else if (typeof value === "object" && value !== null) {
      result[key] = { mapValue: { fields: convertToFirestoreFormat(value) } };
    }
  }

  return result;
}

// =============================
// 🔹 Busca todos os documentos de uma coleção
// =============================
export async function getDocuments(collection) {
  try {
    const res = await fetch(getFirestoreUrl(collection));

    // Checa se houve erro na requisição
    if (!res.ok) throw new Error(`Erro ao obter documentos: ${res.status}`);

    const json = await res.json();

    // Retorna array de documentos ou vazio se não houver
    return json.documents || [];
  } catch (err) {
    console.error(err);
    // Retorna array vazio para não quebrar a aplicação em caso de falha
    return [];
  }
}

// =============================
// 🔹 Cria novo documento em uma coleção
// =============================
export async function createDocument(collection, data) {
  const res = await fetch(getFirestoreUrl(collection), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Converte dados para o formato Firestore antes de enviar
    body: JSON.stringify({ fields: convertToFirestoreFormat(data) }),
  });

  if (!res.ok) throw new Error("Erro ao criar documento");

  return await res.json(); // Retorna o documento criado
}

// =============================
// 🔹 Atualiza documento existente (suporta múltiplos campos)
// =============================
export async function updateDocument(collection, documentId, data) {
  // Gera queryParams para o updateMask (campos que serão atualizados)
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

  return await res.json(); // Retorna o documento atualizado
}

// =============================
// 🔹 Deleta documento de uma coleção
// =============================
export async function deleteDocument(collection, documentId) {
  const res = await fetch(getFirestoreUrl(collection, documentId), {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Erro ao excluir documento");

  return true; // Retorna true se a exclusão foi bem-sucedida
}

// =============================
// 🔹 Busca documento pelo nome
// =============================
export async function findDocumentByName(collection, nome) {
  // Busca todos os documentos da coleção
  const docs = await getDocuments(collection);

  if (!docs || docs.length === 0) return null; // Retorna null se não houver documentos

  // Procura documento cujo campo "nome" seja igual (case insensitive)
  const docEncontrado = docs.find((doc) => {
    const f = doc.fields;
    return f?.nome?.stringValue?.toLowerCase() === nome.toLowerCase();
  });

  if (!docEncontrado) return null; // Retorna null se não encontrou

  // Retorna objeto com id do documento e seus fields
  return {
    id: docEncontrado.name.split("/").pop(),
    fields: docEncontrado.fields,
  };
}
