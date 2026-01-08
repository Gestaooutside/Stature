"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { PaymentModal } from "./index";
import { useCartStore } from "@/lib/stores/cart-store";

export function PaymentModalRoot() {
  const pathname = usePathname();
  const { isOpen, closeCart, resetCheckoutState } = useCartStore();

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  const handleClose = useCallback(() => {
    resetCheckoutState();
    closeCart();
  }, [closeCart, resetCheckoutState]);

  return <PaymentModal isOpen={isOpen} onClose={handleClose} />;
}

