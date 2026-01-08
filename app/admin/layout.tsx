import { ReactNode } from 'react';
import './admin-theme.css';

/**
 * Layout para área administrativa
 * A autenticação é verificada pelo middleware antes de chegar aqui
 * Aplica tema claro forçado para área admin
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-light-theme min-h-screen">
      {children}
    </div>
  );
}
