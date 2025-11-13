import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginButton } from "@/components/auth/LoginButton";
import { Logo } from "@/components/auth/Logo";
import { Mail, Sparkles, Zap, Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Iniciar Sesión - Email Kanban AI",
  description: "Gestiona tus emails con inteligencia artificial",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      {/* Main Card */}
      <Card className="border-0 shadow-2xl shadow-blue-500/10 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-base">
              Transforma tus emails en tareas accionables con IA
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="grid gap-3">
            <FeatureItem
              icon={<Brain className="h-4 w-4" />}
              text="Clasificación inteligente con IA"
            />
            <FeatureItem
              icon={<Zap className="h-4 w-4" />}
              text="Gestión visual con Kanban"
            />
            <FeatureItem
              icon={<Sparkles className="h-4 w-4" />}
              text="Priorización automática"
            />
          </div>

          <Separator />

          {/* Login Button */}
          <div className="space-y-4">
            <LoginButton />

            <p className="text-xs text-center text-muted-foreground">
              Al continuar, aceptas nuestros{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
                Política de Privacidad
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Info */}
      <div className="mt-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          ¿Necesitas ayuda?{" "}
          <a href="#" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
            Contacta soporte
          </a>
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 text-blue-600 dark:text-blue-400">
        {icon}
      </div>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}
