'use client';

/**
 * Página de login administrativo - DUO Natural
 * Design alinhado com a estética editorial do site
 * Usa as cores da marca e tipografia consistente
 */

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface LoginFormProps {
  onSubmit: (email: string, password: string, remember: boolean) => Promise<void>;
}

const AdminLogin: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Detecta viewport mobile para carregar imagem otimizada
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(email, password, remember);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Background Image - Versão responsiva otimizada */}
      <div className="absolute inset-0">
        <Image
          src={isMobile ? "/hero-section-mobile.jpg" : "/hero-section.jpg"}
          alt=""
          fill
          priority
          quality={85}
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Overlays para profundidade - mesmo estilo do hero */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Conteúdo centralizado */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Card de login com glass effect */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Logo e título */}
          <div className="mb-8 text-center">
            <Image
              src="/duo-logo-light.svg"
              alt="DUO Natural"
              width={160}
              height={90}
              priority
              className="mx-auto mb-6 w-[120px] h-[68px] sm:w-[160px] sm:h-[90px]"
            />
            <h1 className="font-display text-2xl sm:text-3xl font-light text-[var(--color-brand-primary-light)] tracking-wide">
              Área Administrativa
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-all text-base"
                placeholder="admin@duo.com"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 pr-12 bg-white/10 backdrop-blur border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[var(--color-brand-primary)] focus:ring-1 focus:ring-[var(--color-brand-primary)] transition-all text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Lembrar-me */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  remember 
                    ? 'bg-[var(--color-brand-primary)]' 
                    : 'bg-[var(--color-brand-primary-dark)]/40'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-[var(--color-brand-primary-light)] rounded-full shadow-md transition-transform duration-200 ${
                    remember ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span
                onClick={() => setRemember(!remember)}
                className="text-sm text-[var(--color-brand-primary-light)]/80 cursor-pointer hover:text-[var(--color-brand-primary-light)] transition-colors"
              >
                Manter conectado
              </span>
            </div>

            {/* Botão Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-2 rounded-lg bg-gradient-to-r from-[var(--color-brand-primary-dark)] via-[var(--color-brand-primary)] to-[var(--color-brand-primary-dark)] bg-size-200 text-white font-medium text-base transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-brand-primary)]/30 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              style={{ backgroundPosition: isSubmitting ? '100% 50%' : '0% 50%' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-white/50 text-xs tracking-wide">
          © 2025 DUO Natural. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
