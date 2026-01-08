"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import CouponsTable from "@/components/admin/coupons-table";
import type { Coupon } from "@/lib/db/schema";
import { adminSidebarLinks } from "@/lib/config/admin-sidebar";

/**
 * Página de Gerenciamento de Cupons - Área Administrativa
 * Permite criar, editar e gerenciar cupons de desconto
 */

export default function AdminCoupons() {
  const [open, setOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carrega cupons ao montar componente
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons");
      if (!response.ok) {
        throw new Error("Erro ao buscar cupons");
      }
      const data = await response.json();
      setCoupons(data.coupons);
    } catch (error) {
      console.error("Erro ao buscar cupons:", error);
      alert("Erro ao carregar cupons");
    } finally {
      setLoading(false);
    }
  };

  // Handler para logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const links = adminSidebarLinks;

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-900 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700",
        "min-h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 group/sidebar py-2 text-left"
            >
              <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Sair
              </motion.span>
            </button>
            <SidebarLink
              link={{
                label: "Admin",
                href: "#",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-white flex items-center justify-center text-neutral-900 text-sm font-bold border border-neutral-200">
                    A
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Área de conteúdo */}
      <div className="flex flex-1 overflow-y-auto">
        <div className="p-3 sm:p-6 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 sm:gap-3 flex-1 w-full">
          {/* Header */}
          <div className="mb-3 sm:mb-6">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Gestão de Cupons
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              Crie e gerencie cupons aplicáveis no checkout
            </p>
          </div>

          {/* Tabela de cupons */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-neutral-600 dark:text-neutral-400">
                Carregando cupons...
              </p>
            </div>
          ) : (
            <CouponsTable initialCoupons={coupons} />
          )}
        </div>
      </div>
    </div>
  );
}

// Logo expandido
const Logo = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src="/logo.svg"
        alt="DUO Logo"
        width={24}
        height={24}
        className="flex-shrink-0"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        DUO Admin
      </motion.span>
    </Link>
  );
};

// Logo colapsado (ícone apenas)
const LogoIcon = () => {
  return (
    <Link
      href="/admin/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image
        src="/logo.svg"
        alt="DUO Logo"
        width={24}
        height={24}
        className="flex-shrink-0"
      />
    </Link>
  );
};
