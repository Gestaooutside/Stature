// Interfaces TypeScript centralizadas para o projeto DUO NATURAL

export interface Swatch {
  name: string
  color: string
}

export interface Product {
  id: string
  name: string
  price: string
  image: string
  badge?: "Novo" | "Back in stock" | "Limitado"
  materials: string[]
  swatches: Swatch[]
  quickLookImages: string[]
  dimensions: string
}

export interface Collection {
  id: string
  name: string
  image: string
  count: string
}

export interface Material {
  id: string
  name: string
  description: string
  backgroundImage: string
  tint: string
}

export interface Testimonial {
  id: string
  name: string
  age: number
  city: string
  avatar?: string
  quote: string
  problem: string
  result: string
  rating: number
}

export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface TrustMetric {
  id: string
  value: string
  label: string
  icon: string
}

export interface ComparisonFeature {
  id: string
  feature: string
  common: boolean
  prescription: boolean
  duo: boolean
}

export interface Ingredient {
  id: string
  name: string
  scientificName?: string
  benefit: string
  icon?: string
}

export interface GuaranteeItem {
  id: string
  title: string
  description: string
  icon: string
}
