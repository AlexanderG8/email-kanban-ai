import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes (opcional, comentar si no deseas eliminar datos)
  await prisma.importLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.email.deleteMany();
  await prisma.user.deleteMany();

  console.log("✓ Datos anteriores eliminados");

  // Crear usuario de prueba
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Usuario de Prueba",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`✓ Usuario creado: ${user.email}`);

  // Crear emails de prueba
  const email1 = await prisma.email.create({
    data: {
      userId: user.id,
      gmailId: "gmail-id-001",
      senderId: "carlos@empresa.com",
      senderName: "Carlos Romano",
      subject: "Solicitud de demo del producto X",
      body: "<p>Hola, me gustaría agendar una demo del producto X para mañana a las 3pm. ¿Es posible?</p>",
      snippet: "Hola, me gustaría agendar una demo del producto X para mañana a las 3pm...",
      category: "Cliente",
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
      hasTask: true,
    },
  });

  const email2 = await prisma.email.create({
    data: {
      userId: user.id,
      gmailId: "gmail-id-002",
      senderId: "maria@prospecto.com",
      senderName: "María González",
      subject: "Información sobre sus servicios",
      body: "<p>Buenos días, vi su producto en LinkedIn. ¿Podrían enviarme más información?</p>",
      snippet: "Buenos días, vi su producto en LinkedIn. ¿Podrían enviarme más información?",
      category: "Lead",
      receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // Hace 5 horas
      hasTask: true,
    },
  });

  const email3 = await prisma.email.create({
    data: {
      userId: user.id,
      gmailId: "gmail-id-003",
      senderId: "colega@miempresa.com",
      senderName: "Juan Pérez",
      subject: "FYI: Reunión pospuesta",
      body: "<p>La reunión de mañana se pospuso para el viernes.</p>",
      snippet: "La reunión de mañana se pospuso para el viernes.",
      category: "Interno",
      receivedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
      hasTask: false,
    },
  });

  console.log(`✓ ${3} emails creados`);

  // Crear tareas de prueba
  const task1 = await prisma.task.create({
    data: {
      userId: user.id,
      emailId: email1.id,
      title: "Demo producto X - Carlos Romano",
      description: "Agendar demo de producto X con Carlos para mañana a las 3pm",
      priority: "Alta",
      status: "Pendiente",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      aiConfidence: 92,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      userId: user.id,
      emailId: email2.id,
      title: "Enviar información - María González",
      description: "Enviar información del producto a nuevo prospecto desde LinkedIn",
      priority: "Media",
      status: "Pendiente",
      aiConfidence: 85,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      userId: user.id,
      emailId: email1.id,
      title: "Preparar material para demo",
      description: "Preparar presentación y material de demo para Carlos Romano",
      priority: "Alta",
      status: "En Progreso",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
      aiConfidence: 88,
    },
  });

  console.log(`✓ ${3} tareas creadas`);

  // Crear comentarios de prueba
  await prisma.comment.create({
    data: {
      userId: user.id,
      taskId: task1.id,
      content: "Confirmada la demo para mañana a las 3pm. Preparar caso de uso específico.",
    },
  });

  await prisma.comment.create({
    data: {
      userId: user.id,
      taskId: task3.id,
      content: "Ya tengo la presentación base, solo falta personalizarla.",
    },
  });

  console.log(`✓ ${2} comentarios creados`);

  // Crear log de importación de prueba
  await prisma.importLog.create({
    data: {
      userId: user.id,
      emailsProcessed: 20,
      emailsWithTasks: 15,
      tasksCreated: 18,
      startedAt: new Date(Date.now() - 10 * 60 * 1000), // Hace 10 minutos
      completedAt: new Date(Date.now() - 8 * 60 * 1000), // Hace 8 minutos
      status: "completed",
    },
  });

  console.log("✓ Log de importación creado");

  console.log("\n✅ Seed completado exitosamente!");
  console.log("\n📊 Resumen:");
  console.log(`   - 1 usuario`);
  console.log(`   - 3 emails (2 con tareas, 1 sin tareas)`);
  console.log(`   - 3 tareas (2 pendientes, 1 en progreso)`);
  console.log(`   - 2 comentarios`);
  console.log(`   - 1 log de importación\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
