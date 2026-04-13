// Depoimentos dos pacientes — dados vindos do brand config (white label)
// Placeholder até receber depoimentos reais autorizados pelo Dr. David.

import type { TestimonialAuthor } from "@/components/ui/testimonial-card"
import { TESTIMONIALS } from "@/lib/config/brand"

export const patientTestimonials = TESTIMONIALS.map((t) => ({
  author: {
    name: t.author.name,
    handle: t.author.handle,
    avatar: t.author.avatar,
  } as TestimonialAuthor,
  text: t.text,
}))

// Backwards-compat alias (página importa duoTestimonials no legado)
export const duoTestimonials = patientTestimonials
