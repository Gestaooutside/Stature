// Card de depoimento individual
// Adaptado da biblioteca SerafimCloud

import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

/**
 * Card de depoimento com avatar, nome e texto
 * Design limpo com borda sutil e tipografia hierárquica
 * Pode ser link (se href fornecido) ou div estático
 */
export function TestimonialCard({
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'

  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-2xl",
        // Design limpo com borda sutil
        "bg-white",
        "border border-neutral-200",
        // Tamanho e espaçamento
        "p-6 sm:p-8",
        "max-w-[420px] sm:max-w-[420px]",
        // Hover elegante e discreto
        "hover:border-neutral-300 hover:bg-neutral-50",
        "transition-all duration-500",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-5">
        <Avatar className="h-14 w-14 ring-2 ring-neutral-200">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="text-base font-semibold leading-tight text-neutral-900">
            {author.name}
          </h3>
          <p className="text-sm text-neutral-600 mt-0.5">
            {author.handle}
          </p>
        </div>
      </div>
      <p className="text-lg leading-relaxed text-neutral-800 font-light">
        {text}
      </p>
    </Card>
  )
}
