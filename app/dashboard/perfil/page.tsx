"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface UserConfig {
  id: string;
  email: string;
  name: string;
  image: string | null;
  referenceDate: string | null;
  lastImportAt: string | null;
}

export default function PerfilPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [hasValidAccess, setHasValidAccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load user configuration
  useEffect(() => {
    async function loadConfig() {
      if (status !== "authenticated") return;

      try {
        const response = await fetch("/api/user/gmail-config");
        const data = await response.json();

        if (response.ok) {
          setUserConfig(data.user);
          setIsConfigured(data.isConfigured);
          setHasValidAccess(data.hasValidAccess);
        }
      } catch (error) {
        console.error("Error loading config:", error);
        toast.error("Error al cargar configuración");
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [status]);

  const handleVerifyAccess = async () => {
    setIsVerifying(true);

    try {
      const response = await fetch("/api/user/gmail-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceDate: userConfig?.referenceDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setHasValidAccess(true);
        setIsConfigured(true);
        toast.success("Acceso a Gmail verificado correctamente");
      } else {
        toast.error("Error al verificar acceso", {
          description: data.message,
        });
      }
    } catch (error) {
      console.error("Error verifying access:", error);
      toast.error("Error al verificar acceso a Gmail");
    } finally {
      setIsVerifying(false);
    }
  };

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-blue-950/30">
        <Header />
        <div className="container max-w-4xl py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">Cargando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-950 dark:to-blue-950/30">
      <Header />

      <div className="container max-w-4xl py-8 px-4">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu información personal y configuración de Gmail
          </p>
        </div>

        <div className="space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Esta información proviene de tu cuenta de Google y no puede editarse aquí
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={session?.user?.image || undefined}
                    alt={session?.user?.name || "Usuario"}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 text-xl font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{session?.user?.name}</h3>
                  <p className="text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="Nombre completo"
                  value={session?.user?.name || "No disponible"}
                />
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Correo electrónico"
                  value={session?.user?.email || "No disponible"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Gmail Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración de Gmail
              </CardTitle>
              <CardDescription>
                Estado de la integración con Gmail API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status indicators */}
              <div className="space-y-3">
                <StatusRow
                  label="Integración configurada"
                  isActive={isConfigured}
                />
                <StatusRow
                  label="Acceso a Gmail válido"
                  isActive={hasValidAccess}
                />
              </div>

              <Separator />

              {/* Configuration details */}
              <div className="grid gap-4">
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Fecha de referencia"
                  value={
                    userConfig?.referenceDate
                      ? new Date(userConfig.referenceDate).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "No configurada"
                  }
                />
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="Última importación"
                  value={
                    userConfig?.lastImportAt
                      ? new Date(userConfig.lastImportAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Nunca"
                  }
                />
              </div>

              {/* Warning if not configured or access invalid */}
              {(!isConfigured || !hasValidAccess) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {!isConfigured
                      ? "Tu integración con Gmail no está configurada. Ve a la página de integración para configurarla."
                      : "Tu acceso a Gmail puede haber expirado. Verifica el acceso para continuar usando la aplicación."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyAccess}
                  disabled={isVerifying}
                  variant={hasValidAccess ? "outline" : "default"}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Verificar acceso a Gmail
                    </>
                  )}
                </Button>

                {!isConfigured && (
                  <Link href="/integracion">
                    <Button>Ir a Configuración</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Información de Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="ID de usuario"
                  value={userConfig?.id || session?.user?.id || "No disponible"}
                  mono
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className={`text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function StatusRow({
  label,
  isActive,
}: {
  label: string;
  isActive: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        {isActive ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-600 dark:text-green-400">Activo</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Pendiente</span>
          </>
        )}
      </div>
    </div>
  );
}
