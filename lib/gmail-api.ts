import { auth } from "@/auth";

export interface GmailMessage {
  id: string;
  threadId: string;
}

export interface EmailData {
  gmailId: string;
  threadId: string;
  senderId: string;
  senderName: string;
  subject: string;
  body: string;
  snippet: string;
  receivedAt: Date;
  hasAttachments: boolean;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  partId?: string;
  mimeType: string;
  filename?: string;
  headers?: GmailHeader[];
  body: {
    size: number;
    data?: string;
    attachmentId?: string;
  };
  parts?: GmailMessagePart[];
}

interface GmailFullMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: GmailMessagePart;
  internalDate: string;
}

/**
 * Get access token from session
 */
async function getAccessToken(): Promise<string> {
  const session = await auth();

  if (!session?.accessToken) {
    throw new Error("No hay access token disponible. El usuario debe autorizar el acceso a Gmail.");
  }

  return session.accessToken;
}

/**
 * Fetch list of Gmail message IDs
 */
export async function fetchGmailMessageIds(
  maxResults: number = 20,
  afterDate?: Date
): Promise<GmailMessage[]> {
  const accessToken = await getAccessToken();

  // Build query string
  let query = "";
  if (afterDate) {
    const timestamp = Math.floor(afterDate.getTime() / 1000);
    query = `after:${timestamp}`;
  }

  const params = new URLSearchParams({
    maxResults: maxResults.toString(),
    ...(query && { q: query }),
  });

  const response = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Gmail API error: ${response.status} - ${error.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.messages || [];
}

/**
 * Fetch full email content by ID
 */
export async function fetchGmailMessage(messageId: string): Promise<GmailFullMessage> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Gmail API error: ${response.status} - ${error.error?.message || response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Decode base64url encoded string
 */
function decodeBase64Url(data: string): string {
  // Replace base64url characters with base64 characters
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");

  try {
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

/**
 * Get header value from message payload
 */
function getHeader(headers: GmailHeader[] | undefined, name: string): string {
  if (!headers) return "";
  const header = headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header?.value || "";
}

/**
 * Parse sender information from "From" header
 * Format can be: "Name <email@example.com>" or just "email@example.com"
 */
function parseSender(from: string): { name: string; email: string } {
  const match = from.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+@[^>]+)>?$/);

  if (match) {
    const name = match[1]?.trim() || match[2].split("@")[0];
    const email = match[2].trim();
    return { name, email };
  }

  return { name: from, email: from };
}

/**
 * Extract email body from message parts
 * Prefers HTML content, falls back to plain text
 */
function extractBody(payload: GmailMessagePart): string {
  let htmlBody = "";
  let textBody = "";

  function processPartRecursive(part: GmailMessagePart) {
    if (part.mimeType === "text/html" && part.body.data) {
      htmlBody = decodeBase64Url(part.body.data);
    } else if (part.mimeType === "text/plain" && part.body.data) {
      textBody = decodeBase64Url(part.body.data);
    }

    // Process nested parts
    if (part.parts) {
      for (const subPart of part.parts) {
        processPartRecursive(subPart);
      }
    }
  }

  // Handle single part messages
  if (payload.body.data) {
    if (payload.mimeType === "text/html") {
      htmlBody = decodeBase64Url(payload.body.data);
    } else if (payload.mimeType === "text/plain") {
      textBody = decodeBase64Url(payload.body.data);
    }
  }

  // Process multipart messages
  if (payload.parts) {
    for (const part of payload.parts) {
      processPartRecursive(part);
    }
  }

  // Return HTML if available, otherwise plain text
  // Convert plain text to basic HTML if needed
  if (htmlBody) {
    return htmlBody;
  }

  if (textBody) {
    // Convert plain text to HTML with line breaks
    return textBody
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }

  return "";
}

/**
 * Check if message has attachments
 */
function hasAttachments(payload: GmailMessagePart): boolean {
  function checkPartsRecursive(part: GmailMessagePart): boolean {
    if (part.filename && part.filename.length > 0) {
      return true;
    }
    if (part.parts) {
      return part.parts.some(checkPartsRecursive);
    }
    return false;
  }

  return checkPartsRecursive(payload);
}

/**
 * Parse Gmail message into EmailData format
 */
export function parseGmailMessage(message: GmailFullMessage): EmailData {
  const headers = message.payload.headers;
  const from = getHeader(headers, "From");
  const subject = getHeader(headers, "Subject") || "(Sin asunto)";
  const date = getHeader(headers, "Date");

  const sender = parseSender(from);
  const body = extractBody(message.payload);

  // Parse date - Gmail provides internalDate as milliseconds timestamp
  const receivedAt = new Date(parseInt(message.internalDate));

  return {
    gmailId: message.id,
    threadId: message.threadId,
    senderId: sender.email,
    senderName: sender.name,
    subject,
    body,
    snippet: message.snippet || "",
    receivedAt,
    hasAttachments: hasAttachments(message.payload),
  };
}

/**
 * Fetch and parse multiple emails
 * Processes in batches for better performance
 */
export async function fetchAndParseEmails(
  maxResults: number = 20,
  afterDate?: Date,
  batchSize: number = 5
): Promise<EmailData[]> {
  // Get list of message IDs
  const messageIds = await fetchGmailMessageIds(maxResults, afterDate);

  if (messageIds.length === 0) {
    return [];
  }

  const emails: EmailData[] = [];

  // Process in batches
  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (msg) => {
        try {
          const fullMessage = await fetchGmailMessage(msg.id);
          return parseGmailMessage(fullMessage);
        } catch (error) {
          console.error(`Error fetching message ${msg.id}:`, error);
          return null;
        }
      })
    );

    // Filter out failed messages
    emails.push(...batchResults.filter((e): e is EmailData => e !== null));
  }

  return emails;
}

/**
 * Verify Gmail API access is working
 */
export async function verifyGmailAccess(): Promise<boolean> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get Gmail profile (email address)
 */
export async function getGmailProfile(): Promise<{ email: string; messagesTotal: number }> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/profile",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener perfil de Gmail");
  }

  const data = await response.json();
  return {
    email: data.emailAddress,
    messagesTotal: data.messagesTotal,
  };
}
