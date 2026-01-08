CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
ALTER TABLE "coupons" ALTER COLUMN "discount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "discount_type" "discount_type" DEFAULT 'percentage' NOT NULL;