import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Obtiene la sesión del usuario actual
 * Redirige a /login si no está autenticado
 */
export async function getAuthSession() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Obtiene el usuario actual desde la base de datos
 * Incluye relaciones útiles
 */
export async function getCurrentUser() {
  const session = await getAuthSession();
  const { prisma } = await import("@/lib/prisma");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      gmailApiKey: true,
      referenceDate: true,
      lastImportAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Verifica si el usuario tiene configurada su Gmail API Key
 */
export async function hasGmailApiKey() {
  const user = await getCurrentUser();
  return !!user.gmailApiKey;
}
