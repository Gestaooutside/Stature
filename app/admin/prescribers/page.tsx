"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LogoIcon } from "@/lib/components/LogoIcon";
import { useRouter } from "next/navigation";
import PrescribersTable from "@/components/admin/prescribers-table";
import type { Prescriber, Representative } from "@/lib/db/schema";
import { adminSidebarLinks } from "@/lib/config/admin-sidebar";

/**
 * Página de Gerenciamento de Prescritores - Área Administrativa
 * Permite criar, editar e gerenciar prescritores/influencers
 */

export default function AdminPrescribers() {
  const [open, setOpen] = useState(false);
  const [prescribers, setPrescribers] = useState<Prescriber[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carrega dados ao montar componente
  useEffect(() => {
    Promise.all([fetchPrescribers(), fetchRepresentatives()]);
  }, []);

  const fetchPrescribers = async () => {
    try {
      const response = await fetch("/api/admin/prescribers");
      if (!response.ok) {
        throw new Error("Erro ao buscar prescritores");
      }
      const data = await response.json();
      setPrescribers(data.prescribers);
    } catch (error) {
      console.error("Erro ao buscar prescritores:", error);
      alert("Erro ao carregar prescritores");
    } finally {
      setLoading(false);
    }
  };

  const fetchRepresentatives = async () => {
    try {
      const response = await fetch("/api/admin/representatives");
      if (!response.ok) {
        throw new Error("Erro ao buscar representantes");
      }
      const data = await response.json();
      setRepresentatives(data.representatives);
    } catch (error) {
      console.error("Erro ao buscar representantes:", error);
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

  const Logo = () => (
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-5 w-6 bg-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black whitespace-pre"
      >
        DUO Admin
      </motion.span>
    </div>
  );

  

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row bg-gray-100 w-full flex-1 mx-auto border border-neutral-200",
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
              <LogOut className="text-neutral-700 h-5 w-5 flex-shrink-0" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-neutral-700 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
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
        <div className="p-3 sm:p-6 md:p-10 rounded-tl-2xl border border-neutral-200 bg-white flex flex-col gap-2 sm:gap-3 flex-1 w-full">
          {/* Header */}
          <div className="mb-3 sm:mb-6">
            <h1 className="text-2xl font-bold text-neutral-800">
              Gestão de Prescritores
            </h1>
            <p className="text-neutral-600 text-sm mt-1">
              Gerencie prescritores e influencers que criam cupons de desconto
            </p>
          </div>

          {/* Conteúdo */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-neutral-500">Carregando prescritores...</div>
            </div>
          ) : (
            <PrescribersTable
              prescribers={prescribers}
              representatives={representatives}
              onPrescriberCreated={fetchPrescribers}
              onPrescriberUpdated={fetchPrescribers}
              onPrescriberDeleted={fetchPrescribers}
            />
          )}
        </div>
      </div>
    </div>
  );
}
