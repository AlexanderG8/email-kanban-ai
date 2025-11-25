"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/auth/Logo";
import { SearchBar } from "@/components/filters/SearchBar";
import { FilterDropdowns } from "@/components/filters/FilterDropdowns";
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  Loader2,
  LayoutDashboard,
  Mail,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";

interface HeaderProps {
  showSearch?: boolean;
  showFilters?: boolean;
}

export function Header({ showSearch = false, showFilters = false }: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const reset = useStore((state) => state.reset);

  const user = session?.user;
  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Clear Zustand store
      reset();

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("email-kanban-storage");
      }

      // Sign out with NextAuth
      await signOut({
        redirect: false,
      });

      toast.success("Sesión cerrada correctamente");

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error al cerrar sesión", {
        description: "Por favor, intenta nuevamente.",
      });
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo with Navigation Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-transparent">
                <Logo size="sm" />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Kanban</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emailsprocesados" className="flex items-center cursor-pointer">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Emails Procesados</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/analisis" className="flex items-center cursor-pointer">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Estadísticas</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Center - Search & Filters */}
          {(showSearch || showFilters) && (
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl mx-8">
              {showSearch && <SearchBar />}
              {showFilters && <FilterDropdowns />}
            </div>
          )}

          {/* Right side - User menu */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || undefined} alt={user?.name || "Usuario"} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 text-xs font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium max-w-[150px] truncate">
                    {user?.name || "Usuario"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Ver Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowLogoutDialog(true)}
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              Serás redirigido a la página de login. Tendrás que iniciar sesión
              nuevamente para acceder a la aplicación.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sí, cerrar sesión
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
