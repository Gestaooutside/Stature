CREATE TYPE "public"."delivery_status" AS ENUM('PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'RETURNED');--> statement-breakpoint
CREATE TABLE "knowledge_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_file" text NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(3072) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_status" "delivery_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
CREATE INDEX "knowledge_chunks_embedding_idx" ON "knowledge_chunks" USING hnsw ("embedding" vector_cosine_ops);