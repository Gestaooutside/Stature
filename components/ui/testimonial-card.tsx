import { cn } from "@/lib/utils"
import Image from "next/image"

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

function initials(name: string) {
  const parts = name.replace(/[,.].*$/, "").trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? "")
  return (first + last).toUpperCase()
}

export function TestimonialCard({ author, text, href, className }: TestimonialCardProps) {
  const Card = href ? "a" : "div"

  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "relative flex flex-col matte-card p-10",
        "w-[380px] min-w-[380px] max-w-[380px]",
        "transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:border-[#D9C89E]/40",
        className,
      )}
    >
      {/* Oversized opening quote */}
      <span
        className="absolute top-4 left-8 font-display italic text-[#D9C89E]/40 pointer-events-none select-none"
        style={{ fontSize: "96px", lineHeight: 1 }}
        aria-hidden
      >
        &ldquo;
      </span>

      <p className="relative text-base leading-[1.85] text-[#EDE4D0]/85 font-light text-left mb-10 mt-12 flex-1">
        {text}
      </p>
      <span className="hairline-gold w-10 mb-6" />

      <div className="flex items-center gap-4">
        {/* Avatar or Monogram circle */}
        {author.avatar ? (
          <div className="relative w-11 h-11 flex-shrink-0 rounded-full overflow-hidden border border-[#D9C89E]/40">
            <Image
              src={author.avatar}
              alt={author.name}
              fill
              className="object-cover"
              sizes="44px"
            />
          </div>
        ) : (
          <span
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center border border-[#D9C89E]/40 rounded-full font-display italic text-[#D9C89E] text-base"
            aria-hidden
          >
            {initials(author.name)}
          </span>
        )}
        <div className="flex flex-col items-start">
          <h3 className="font-display italic text-base font-normal leading-tight text-[#EDE4D0]">
            {author.name}
          </h3>
          <p className="font-mono-label text-[#D9C89E]/70 mt-1">{author.handle}</p>
        </div>
      </div>
    </Card>
  )
}
