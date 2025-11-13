import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/auth-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  // Si no tiene Gmail API Key configurada, redirigir a integración
  if (!user.gmailApiKey) {
    redirect("/integracion");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-blue-950/30 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido, {user.name}
            </p>
          </div>
          <Link href="/api/auth/signout">
            <Button variant="outline">Cerrar Sesión</Button>
          </Link>
        </div>

        {/* Welcome Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
                <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>¡Configuración Completa!</CardTitle>
                <CardDescription>
                  Tu cuenta está lista para usar Email Kanban AI
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <StatusItem
                icon={<Mail className="h-4 w-4" />}
                text="Autenticación con Google"
                status="completed"
              />
              <StatusItem
                icon={<CheckCircle2 className="h-4 w-4" />}
                text="Gmail API configurada"
                status="completed"
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                El resto de las funcionalidades (Kanban, importación de emails, clasificación con IA)
                se implementarán en los siguientes sprints.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Información de Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Nombre" value={user.name} />
            <InfoRow label="Gmail API Key" value={user.gmailApiKey ? "Configurada ✓" : "No configurada"} />
            <InfoRow
              label="Última importación"
              value={user.lastImportAt ? new Date(user.lastImportAt).toLocaleDateString() : "Nunca"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusItem({
  icon,
  text,
  status,
}: {
  icon: React.ReactNode;
  text: string;
  status: "completed" | "pending";
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          status === "completed"
            ? "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
            : "bg-gray-100 dark:bg-gray-900 text-gray-400"
        }`}
      >
        {icon}
      </div>
      <span className="text-muted-foreground">{text}</span>
      {status === "completed" && (
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-mono">{value}</span>
    </div>
  );
}
