'use client';

import { useRouter } from 'next/navigation';
import AdminLogin from '@/components/ui/admin-login';

/**
 * Página de login para área administrativa
 * Rota: /admin/login
 */
export default function AdminLoginPage() {
  const router = useRouter();

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Login bem-sucedido - redirecionar para dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      // Re-lançar erro para que o componente AdminLogin possa exibir
      throw error;
    }
  };

  return <AdminLogin onSubmit={handleLogin} />;
}
