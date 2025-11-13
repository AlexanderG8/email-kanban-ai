import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/auth-utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function IntegracionPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = await getCurrentUser();

  // Si ya tiene Gmail API Key, redirigir al dashboard
  if (user.gmailApiKey) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full max-w-2xl">
      <Card className="border-0 shadow-2xl shadow-blue-500/10 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                Configuración Pendiente
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Para usar Email Kanban AI, necesitas configurar tu Gmail API Key
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
            <h3 className="font-semibold text-sm">Esta funcionalidad estará disponible en el Sprint 2</h3>
            <p className="text-sm text-muted-foreground">
              En el próximo sprint implementaremos:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Formulario para configurar Gmail API Key</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Validación de API Key con Gmail</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Encriptación segura de credenciales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Configuración de fecha de referencia</span>
              </li>
            </ul>
          </div>

          {/* Temporary Action */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Por ahora, puedes continuar al dashboard para ver la estructura de la aplicación:
            </p>
            <Link href="/dashboard">
              <Button className="w-full" size="lg">
                Ir al Dashboard (Modo Demo)
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* User Info */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Sesión iniciada como: <span className="font-mono">{user.email}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Back to login */}
      <div className="mt-6 text-center">
        <Link href="/api/auth/signout">
          <Button variant="ghost" size="sm">
            Cerrar Sesión
          </Button>
        </Link>
      </div>
    </div>
  );
}
