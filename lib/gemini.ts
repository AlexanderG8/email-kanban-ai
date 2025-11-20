import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import type { EmailData } from "./gmail-api";

// Schema for classification response
const TaskSchema = z.object({
  description: z.string().max(150).describe("Descripción clara de la tarea"),
  priority: z.enum(["Urgente", "Alta", "Media", "Baja"]).describe("Prioridad de la tarea"),
  dueDate: z.string().nullable().describe("Fecha límite en formato ISO o null"),
});

const ClassificationSchema = z.object({
  category: z.enum(["Cliente", "Lead", "Interno", "Spam"]).describe("Categoría del email"),
  priority: z.enum(["Urgente", "Alta", "Media", "Baja"]).describe("Prioridad general"),
  hasTask: z.boolean().describe("Si el email contiene tareas accionables"),
  tasks: z.array(TaskSchema).describe("Lista de tareas detectadas"),
  confidence: z.number().min(0).max(100).describe("Nivel de confianza 0-100"),
});

export type EmailClassification = z.infer<typeof ClassificationSchema>;
export type TaskClassification = z.infer<typeof TaskSchema>;

/**
 * Build the classification prompt for Gemini
 */
function buildClassificationPrompt(email: EmailData): string {
  // Truncate body to 5000 characters for token limits
  const truncatedBody = email.body.length > 5000
    ? email.body.substring(0, 5000) + "..."
    : email.body;

  // Strip HTML tags for cleaner text
  const cleanBody = truncatedBody
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `Eres un asistente experto en clasificación de emails comerciales.

Analiza este email y extrae información estructurada:

DATOS DEL EMAIL:
- Remitente: ${email.senderName} <${email.senderId}>
- Asunto: ${email.subject}
- Cuerpo: ${cleanBody}
- Fecha de recepción: ${email.receivedAt.toISOString()}

Fecha actual del sistema: ${new Date().toISOString()}

INSTRUCCIONES:
1. Clasifica el email en UNA categoría:
   - "Cliente": Solicitud o consulta de cliente conocido/existente
   - "Lead": Nuevo prospecto mostrando interés comercial
   - "Interno": Comunicación del equipo o administrativa
   - "Spam": Sin valor comercial (promociones, newsletters no solicitados)

2. Determina si hay tarea(s) accionable(s):
   - Una tarea es cualquier acción que el destinatario debe realizar
   - Ejemplos: agendar reunión, enviar cotización, hacer seguimiento, llamar, etc.
   - Si hay múltiples acciones, sepáralas como tareas individuales

3. Asigna prioridad basándote en:
   - "Urgente": Contiene palabras como "urgente", "hoy", "ASAP" o deadline <24 horas
   - "Alta": Deadline entre 1-7 días o solicitud importante de cliente
   - "Media": Deadline >7 días o sin urgencia explícita
   - "Baja": Informativo con acción opcional

4. IMPORTANTE: Si el email tiene >2 días de antigüedad y menciona fechas relativas como "mañana" o "hoy", considera que ya expiró y NO marques como tarea urgente.

5. Si no hay tareas, devuelve hasTask: false y tasks como array vacío.

6. Para las fechas límite (dueDate), usa formato ISO 8601 o null si no aplica.`;
}

/**
 * Classify an email using Gemini AI
 */
export async function classifyEmail(email: EmailData): Promise<EmailClassification> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured, using fallback classification");
    return getFallbackClassification();
  }

  try {
    const prompt = buildClassificationPrompt(email);

    // Create Google AI provider with API key
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: ClassificationSchema,
      prompt,
      temperature: 0.1, // Low temperature for more consistent results
    });

    return object;
  } catch (error) {
    console.error("Error classifying email with Gemini:", error);
    return getFallbackClassification();
  }
}

/**
 * Fallback classification when Gemini is not available
 */
function getFallbackClassification(): EmailClassification {
  return {
    category: "Interno",
    priority: "Media",
    hasTask: false,
    tasks: [],
    confidence: 0,
  };
}

/**
 * Batch classify multiple emails
 * Processes sequentially to avoid rate limits
 */
export async function classifyEmails(
  emails: EmailData[],
  onProgress?: (processed: number, total: number) => void
): Promise<Map<string, EmailClassification>> {
  const results = new Map<string, EmailClassification>();

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    try {
      const classification = await classifyEmail(email);
      results.set(email.gmailId, classification);
    } catch (error) {
      console.error(`Error classifying email ${email.gmailId}:`, error);
      results.set(email.gmailId, getFallbackClassification());
    }

    if (onProgress) {
      onProgress(i + 1, emails.length);
    }

    // Small delay between requests to avoid rate limiting
    if (i < emails.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}

/**
 * Check if Gemini API is configured and accessible
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Generate task title from email data and task description
 */
export function generateTaskTitle(
  email: EmailData,
  taskDescription: string
): string {
  // Extract first part of description (max 50 chars) and add sender name
  const shortDesc = taskDescription.length > 50
    ? taskDescription.substring(0, 47) + "..."
    : taskDescription;

  return `${shortDesc} - ${email.senderName}`;
}
