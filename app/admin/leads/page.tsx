"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import TubeLightNavBar from "@/components/ui/tubelight-navbar";
import NewsletterLeadsTable from "@/components/admin/newsletter-leads-table";
import CheckoutLeadsTable from "@/components/admin/checkout-leads-table";
import { adminSidebarLinks } from "@/lib/config/admin-sidebar";

/**
 * Página de Gestão de Leads - Área administrativa do DUO
 * Permite visualizar e gerenciar leads de newsletter e checkout
 * Protegida por autenticação (middleware)
 */
export default function LeadsPage() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Leads Cupom 5%");
  const router = useRouter();

  // Handler para logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const links = adminSidebarLinks;

  // Componente modificado para aceitar activeTab prop
  const ModifiedTubeLightNavBar = () => {
    const navRef = React.useRef<HTMLDivElement>(null);
    const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
    const tabs = ["Leads Cupom 5%", "Leads Checkout"];

    const handleTabChange = (tab: string) => {
      setActiveTab(tab);
    };

    React.useEffect(() => {
      if (navRef.current) {
        const navRect = navRef.current.getBoundingClientRect();
        const buttons = navRef.current.querySelectorAll('button');
        const activeIndex = tabs.indexOf(activeTab);
        const activeButton = buttons[activeIndex] as HTMLButtonElement;

        if (activeButton && navRef.current) {
          const buttonRect = activeButton.getBoundingClientRect();

          setHighlightStyle({
            left: `${buttonRect.left - navRect.left}px`,
            width: `${buttonRect.width}px`,
            top: `${buttonRect.top - navRect.top}px`,
            height: `${buttonRect.height}px`,
          });
        }
      }
    }, [activeTab]);

    const Tab = ({ text, isActive, onClick }: { text: string; isActive: boolean; onClick: () => void }) => {
      return (
        <button
          onClick={onClick}
          className={`${
            isActive
              ? "text-neutral-950"
              : "text-neutral-500 hover:text-neutral-700"
          } relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-within:outline-none`}
        >
          <span className="relative z-10">{text}</span>
          {isActive && (
            <motion.div
              layoutId="tab-pill"
              className="absolute inset-0 bg-[#f0ede6] rounded-full"
              initial={false}
              transition={{
                type: "spring",
                bounce: 0.2,
                duration: 0.6,
              }}
            />
          )}
        </button>
      );
    };

    return (
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div
            ref={navRef}
            className="relative flex items-center justify-center rounded-full bg-[#fafafa] p-1 shadow-[inset_0_1px_3px_0_rgba(0,0,0,0.1)]"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab}
                text={tab}
                isActive={activeTab === tab}
                onClick={() => handleTabChange(tab)}
              />
            ))}
          </div>
          <motion.div
            className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#e3dfd6] via-[#f0ede6] to-[#e3dfd6]"
            style={highlightStyle}
            initial={false}
            animate={highlightStyle}
            transition={{
              type: "spring",
              bounce: 0.3,
              duration: 0.5,
            }}
          />
        </div>
      </div>
    );
  };

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
              className="flex items-center justify-start gap-2 group/sidebar py-3 md:py-2 text-left touch-manipulation"
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
      <LeadsContent activeTab={activeTab} ModifiedTubeLightNavBar={ModifiedTubeLightNavBar} />
    </div>
  );
}

// Componente de conteúdo da página de leads
const LeadsContent = ({
  activeTab,
  ModifiedTubeLightNavBar
}: {
  activeTab: string;
  ModifiedTubeLightNavBar: () => JSX.Element;
}) => {
  return (
    <div className="flex flex-1 overflow-y-auto">
      <div className="p-3 sm:p-6 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Gestão de Leads
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm">
            Visualize e gerencie leads capturados dos formulários de cupom de 5% e de checkout
          </p>
        </div>

        {/* Navegação entre tabelas */}
        <ModifiedTubeLightNavBar />

        {/* Conteúdo baseado na aba ativa */}
        <div className="flex-1">
          {activeTab === "Leads Cupom 5%" ? (
            <NewsletterLeadsTable />
          ) : (
            <CheckoutLeadsTable />
          )}
        </div>
      </div>
    </div>
  );
};

// Logo expandido
export const Logo = () => {
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
export const LogoIcon = () => {
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