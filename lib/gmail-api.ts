import { auth } from "@/auth";

/**
 * Obtiene los emails del usuario usando Gmail API
 * Requiere que el usuario haya autorizado el acceso a Gmail
 */
export async function fetchGmailMessages(maxResults: number = 10) {
  const session = await auth();

  if (!session?.accessToken) {
    throw new Error("No hay access token disponible. El usuario debe autorizar el acceso a Gmail.");
  }

  try {
    // Obtener lista de mensajes
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error("Error al obtener emails de Gmail:", error);
    throw error;
  }
}

/**
 * Obtiene el contenido completo de un email específico
 */
export async function fetchGmailMessage(messageId: string) {
  const session = await auth();

  if (!session?.accessToken) {
    throw new Error("No hay access token disponible.");
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener mensaje de Gmail:", error);
    throw error;
  }
}

/**
 * Verifica si el usuario tiene autorización activa para Gmail
 */
export async function hasGmailAccess(): Promise<boolean> {
  const session = await auth();
  return !!session?.accessToken;
}
