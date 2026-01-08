"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Card de estatísticas para dashboards
 * Exibe métricas de forma visual e compacta
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number; // Percentual de variação
    label?: string;
  };
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-neutral-700",
  trend,
  loading = false,
  className
}: StatsCardProps) {
  // Determina cor do trend (positivo = verde, negativo = vermelho)
  const trendColor = trend && trend.value >= 0 ? "text-green-600" : "text-red-600";
  const trendBg = trend && trend.value >= 0 ? "bg-green-50" : "bg-red-50";

  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
          "animate-pulse",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-neutral-200 p-2 w-10 h-10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-neutral-200 rounded w-24" />
            <div className="h-6 bg-neutral-200 rounded w-32" />
            <div className="h-3 bg-neutral-200 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Ícone */}
        {Icon && (
          <div className={cn("rounded-full bg-neutral-100 p-2", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <p className="text-xs uppercase tracking-wide text-neutral-500 font-medium truncate">
            {title}
          </p>

          {/* Valor */}
          <p className="text-2xl font-semibold text-neutral-900 mt-1 truncate">
            {value}
          </p>

          {/* Subtitle ou Trend */}
          {subtitle && !trend && (
            <p className="text-xs text-neutral-600 mt-1 truncate">{subtitle}</p>
          )}

          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  trendColor,
                  trendBg
                )}
              >
                {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-xs text-neutral-500">{trend.label}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid de Stats Cards para organizar múltiplos cards
 */
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ 
  children, 
  columns = 3,
  className 
}: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}
