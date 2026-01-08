// Indicador visual de progresso entre steps do modal
// Mostra step atual e permite navegação

'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

/**
 * Componente de indicador de steps
 * Exibe progresso visual entre etapas do checkout
 */
export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Steps - Desktop */}
      <div className="hidden lg:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = onStepClick && step.number < currentStep;

          return (
            <div key={step.number} className="flex flex-1 items-center">
              {/* Step circle */}
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={cn(
                  'group flex flex-col items-center gap-2',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    'relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted &&
                      'border-[var(--color-dia-primary)] bg-[var(--color-dia-primary)]',
                    isCurrent &&
                      'border-[var(--color-brand-primary)] bg-white ring-4 ring-[var(--color-brand-primary)]/20',
                    !isCompleted &&
                      !isCurrent &&
                      'border-neutral-300 bg-neutral-100',
                    isClickable && 'group-hover:scale-110'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'font-semibold',
                        isCurrent && 'text-[var(--color-brand-primary)]',
                        !isCurrent && 'text-neutral-500'
                      )}
                    >
                      {step.number}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      (isCompleted || isCurrent) && 'text-neutral-900',
                      !isCompleted && !isCurrent && 'text-neutral-500'
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-neutral-500">
                      {step.description}
                    </span>
                  )}
                </div>
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 flex-1 transition-all',
                    isCompleted
                      ? 'bg-[var(--color-dia-primary)]'
                      : 'bg-neutral-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Steps - Tablet (intermediário) - Agora clicável */}
      <div className="hidden md:flex lg:hidden items-center justify-center gap-4">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = onStepClick && step.number < currentStep;

          return (
            <div key={step.number} className="flex items-center gap-2">
              {/* Circle compacto - botão clicável para steps completados */}
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                  isCompleted &&
                    'border-[var(--color-dia-primary)] bg-[var(--color-dia-primary)]',
                  isCurrent &&
                    'border-[var(--color-brand-primary)] bg-white ring-2 ring-[var(--color-brand-primary)]/20',
                  !isCompleted &&
                    !isCurrent &&
                    'border-neutral-300 bg-neutral-100',
                  isClickable && 'cursor-pointer hover:scale-110 active:scale-95',
                  !isClickable && 'cursor-default'
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      isCurrent && 'text-[var(--color-brand-primary)]',
                      !isCurrent && 'text-neutral-500'
                    )}
                  >
                    {step.number}
                  </span>
                )}
              </button>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-6 transition-all',
                    isCompleted
                      ? 'bg-[var(--color-dia-primary)]'
                      : 'bg-neutral-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Steps - Mobile (muito compacto) - Agora clicável */}
      <div className="flex md:hidden items-center justify-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--color-brand-primary)] bg-white">
            <span className="text-xs font-semibold text-[var(--color-brand-primary)]">
              {currentStep}
            </span>
          </div>
          <div className="flex gap-1">
            {steps.map((step) => {
              const isClickable = onStepClick && step.number < currentStep;
              
              return (
                <button
                  key={step.number}
                  onClick={() => isClickable && onStepClick(step.number)}
                  disabled={!isClickable}
                  className={cn(
                    'h-1.5 w-6 rounded-full transition-all',
                    step.number < currentStep &&
                      'bg-[var(--color-dia-primary)]',
                    step.number === currentStep &&
                      'bg-[var(--color-brand-primary)]',
                    step.number > currentStep && 'bg-neutral-200',
                    isClickable && 'cursor-pointer hover:opacity-80 active:scale-95',
                    !isClickable && 'cursor-default'
                  )}
                  aria-label={`Voltar para ${step.title}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
