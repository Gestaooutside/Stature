ALTER TYPE "public"."payment_status" ADD VALUE 'OVERDUE' BEFORE 'REFUNDED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'RECEIVED_IN_CASH' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'REFUND_REQUESTED' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'CHARGEBACK_REQUESTED' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'CHARGEBACK_DISPUTE' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'AWAITING_CHARGEBACK_REVERSAL' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'DUNNING_REQUESTED' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'DUNNING_RECEIVED' BEFORE 'CANCELLED';--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'AWAITING_RISK_ANALYSIS' BEFORE 'CANCELLED';