import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Loader2, Users, UserCircle, Calendar, Trophy, Sparkles, LogOut, Home } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TournamentAdminLayoutProps {
  children: React.ReactNode;
}

export default function TournamentAdminLayout({ children }: TournamentAdminLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const logout = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast.success("Sesión cerrada exitosamente");
      window.location.href = "/";
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Acceso Restringido</h1>
        <p className="text-muted-foreground">Debes iniciar sesión para acceder al panel de administración</p>
        <Button asChild>
          <a href={getLoginUrl()}>Iniciar Sesión</a>
        </Button>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Acceso Denegado</h1>
        <p className="text-muted-foreground">Solo los administradores pueden acceder a esta sección</p>
        <Button asChild>
          <Link href="/">Volver al Inicio</Link>
        </Button>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/teams", icon: Users, label: "Equipos" },
    { href: "/admin/players", icon: UserCircle, label: "Jugadores" },
    { href: "/admin/matches", icon: Calendar, label: "Partidos" },
    { href: "/admin/cheerleading", icon: Sparkles, label: "Cheerleading" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-black/30 backdrop-blur-sm border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Trophy className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Torno Intersalesiano</h1>
                <p className="text-xs text-gray-400">Panel de Administración</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Home className="w-4 h-4" />
              Vista Pública
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
          <div className="pt-2 text-xs text-gray-400">
            <p>Administrador: {user?.name}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
