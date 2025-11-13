import { prisma } from "@/lib/prisma";

async function cleanUsers() {
  try {
    console.log("🧹 Limpiando base de datos...");

    // Eliminar todos los usuarios (cascade eliminará accounts, sessions, etc.)
    const deleted = await prisma.user.deleteMany({});

    console.log(`✅ ${deleted.count} usuarios eliminados exitosamente`);
    console.log("✅ Base de datos limpia. Ahora puedes iniciar sesión con Google");
  } catch (error) {
    console.error("❌ Error al limpiar la base de datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanUsers();
