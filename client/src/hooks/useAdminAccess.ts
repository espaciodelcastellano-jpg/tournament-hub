import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export function useAdminAccess() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Redirigir a login si no está autenticado
      setLocation('/admin-login');
    }
    
    setIsLoading(false);
  }, [setLocation]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setLocation('/admin-login');
  };

  return { isAuthenticated, isLoading, logout };
}
