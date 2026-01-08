import Link from "next/link";
import Image from "next/image";

// Componente LogoIcon padrão que usa a logo DUO em vez de ícone genérico
export const LogoIcon = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src="/logo.svg" alt="DUO Logo" width={24} height={24} className="flex-shrink-0" />
    </Link>
  );
};