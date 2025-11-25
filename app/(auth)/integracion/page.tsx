"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function IntegracionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [hasValidAccess, setHasValidAccess] = useState(false);
  const [referenceDate, setReferenceDate] = useState(() => {
    // Default: 30 days ago
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Check current configuration status
  useEffect(() => {
    async function checkConfig() {
      if (status !== "authenticated") return;

      try {
        const response = await fetch("/api/user/gmail-config");
        const data = await response.json();

        if (response.ok) {
          setIsConfigured(data.isConfigured);
          setHasValidAccess(data.hasValidAccess);

          // If already configured, redirect to dashboard
          if (data.isConfigured && data.hasValidAccess) {
            router.push("/dashboard");
            return;
          }
        }
      } catch (err) {
        console.error("Error checking config:", err);
      } finally {
        setIsVerifying(false);
      }
    }

    checkConfig();
  }, [status, router]);

  const handleSaveConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/gmail-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceDate: referenceDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al configurar Gmail");

        if (data.code === "TOKEN_EXPIRED") {
          toast.error("Tu sesión ha expirado", {
            description: "Por favor, cierra sesión e inicia sesión nuevamente.",
          });
        } else if (data.code === "INSUFFICIENT_PERMISSIONS") {
          toast.error("Permisos insuficientes", {
            description:
              "Necesitas autorizar el acceso a Gmail. Cierra sesión e inicia sesión nuevamente.",
          });
        } else {
          toast.error("Error de configuración", {
            description: data.message,
          });
        }
        return;
      }

      toast.success("¡Configuración completada!", {
        description: "Ya puedes importar tus emails.",
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving config:", err);
      setError("Error al guardar la configuración. Por favor, intenta nuevamente.");
      toast.error("Error", {
        description: "No se pudo guardar la configuración.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info("Configuración omitida", {
      description: "Podrás configurar Gmail desde tu perfil más tarde.",
    });
    router.push("/dashboard");
  };

  if (status === "loading" || isVerifying) {
    return (
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-2xl shadow-blue-500/10 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">
              Verificando configuración...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <Card className="border-0 shadow-2xl shadow-blue-500/10 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80">
        <CardHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">
                Configura tu integración con Gmail
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Verifica que todo esté listo para importar tus emails
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OAuth Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm text-green-800 dark:text-green-200">
                  Autenticación completada
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Has autorizado el acceso a Gmail con tu cuenta de Google
                </p>
              </div>
            </div>

            {hasValidAccess && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-green-800 dark:text-green-200">
                    Acceso a Gmail verificado
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    La conexión con Gmail API está funcionando correctamente
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reference Date */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="referenceDate" className="text-sm font-medium">
                Fecha de referencia
              </Label>
            </div>
            <Input
              id="referenceDate"
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              className="max-w-xs"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Esta fecha es referencial para futuras funcionalidades. Por defecto
              se establecen los últimos 30 días.
            </p>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Información importante
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Tus datos están protegidos y encriptados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Solo leemos emails, nunca los modificamos ni enviamos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Puedes revocar el acceso en cualquier momento</span>
              </li>
            </ul>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleSaveConfig}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Guardar y continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Help Link */}
          <div className="text-center pt-2">
            <Link
              href="https://support.google.com/mail/answer/7126229"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              ¿Necesitas ayuda con Gmail?
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {/* User Info */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Sesión iniciada como:{" "}
              <span className="font-mono">{session?.user?.email}</span>
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
