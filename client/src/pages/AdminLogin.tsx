import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();

  const validatePasswordMutation = trpc.admin.validatePassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await validatePasswordMutation.mutateAsync({ password });

      if (result.success) {
        // Guardar token en localStorage
        localStorage.setItem('adminToken', result.token);
        toast.success('¡Bienvenido al panel de administración!');
        setLocation('/admin');
      } else {
        setError('Contraseña incorrecta');
        toast.error('Contraseña incorrecta');
      }
    } catch (err) {
      setError('Error al validar contraseña');
      toast.error('Error al validar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Torno Intersalesiano</h1>
          </div>
          <p className="text-gray-400">Panel de Administración</p>
        </div>

        {/* Login Card */}
        <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="w-5 h-5 text-blue-400" />
              Acceso Restringido
            </CardTitle>
            <CardDescription>
              Ingresa la contraseña para acceder al panel de administración
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className="bg-black/40 border-white/20 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                disabled={isLoading || !password}
              >
                {isLoading ? 'Validando...' : 'Acceder al Panel'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center">
                Este panel es solo para administradores autorizados.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            ¿Necesitas ayuda? Contacta al administrador principal
          </p>
        </div>
      </div>
    </div>
  );
}
