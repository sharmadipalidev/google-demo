ALTER TABLE "corsair_entities" DROP CONSTRAINT "corsair_entities_account_id_corsair_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "corsair_events" DROP CONSTRAINT "corsair_events_account_id_corsair_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "corsair_entities" ADD CONSTRAINT "corsair_entities_account_id_corsair_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."corsair_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corsair_events" ADD CONSTRAINT "corsair_events_account_id_corsair_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."corsair_accounts"("id") ON DELETE cascade ON UPDATE no action;