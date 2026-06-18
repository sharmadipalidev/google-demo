import { pgTable, check, text, timestamp, jsonb, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const corsairIntegrations = pgTable("corsair_integrations", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	name: text().notNull(),
	config: jsonb().default({}).notNull(),
	dek: text(),
}, (table) => [
	check("corsair_integrations_id_not_null", sql`NOT NULL id`),
	check("corsair_integrations_created_at_not_null", sql`NOT NULL created_at`),
	check("corsair_integrations_updated_at_not_null", sql`NOT NULL updated_at`),
	check("corsair_integrations_name_not_null", sql`NOT NULL name`),
	check("corsair_integrations_config_not_null", sql`NOT NULL config`),
]);

export const corsairAccounts = pgTable("corsair_accounts", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	tenantId: text("tenant_id").notNull(),
	integrationId: text("integration_id").notNull(),
	config: jsonb().default({}).notNull(),
	dek: text(),
}, (table) => [
	foreignKey({
			columns: [table.integrationId],
			foreignColumns: [corsairIntegrations.id],
			name: "corsair_accounts_integration_id_corsair_integrations_id_fk"
		}),
	check("corsair_accounts_id_not_null", sql`NOT NULL id`),
	check("corsair_accounts_created_at_not_null", sql`NOT NULL created_at`),
	check("corsair_accounts_updated_at_not_null", sql`NOT NULL updated_at`),
	check("corsair_accounts_tenant_id_not_null", sql`NOT NULL tenant_id`),
	check("corsair_accounts_integration_id_not_null", sql`NOT NULL integration_id`),
	check("corsair_accounts_config_not_null", sql`NOT NULL config`),
]);

export const corsairEntities = pgTable("corsair_entities", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	accountId: text("account_id").notNull(),
	entityId: text("entity_id").notNull(),
	entityType: text("entity_type").notNull(),
	version: text().notNull(),
	data: jsonb().default({}).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [corsairAccounts.id],
			name: "corsair_entities_account_id_corsair_accounts_id_fk"
		}),
	check("corsair_entities_id_not_null", sql`NOT NULL id`),
	check("corsair_entities_created_at_not_null", sql`NOT NULL created_at`),
	check("corsair_entities_updated_at_not_null", sql`NOT NULL updated_at`),
	check("corsair_entities_account_id_not_null", sql`NOT NULL account_id`),
	check("corsair_entities_entity_id_not_null", sql`NOT NULL entity_id`),
	check("corsair_entities_entity_type_not_null", sql`NOT NULL entity_type`),
	check("corsair_entities_version_not_null", sql`NOT NULL version`),
	check("corsair_entities_data_not_null", sql`NOT NULL data`),
]);

export const corsairEvents = pgTable("corsair_events", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	accountId: text("account_id").notNull(),
	eventType: text("event_type").notNull(),
	payload: jsonb().default({}).notNull(),
	status: text(),
}, (table) => [
	foreignKey({
			columns: [table.accountId],
			foreignColumns: [corsairAccounts.id],
			name: "corsair_events_account_id_corsair_accounts_id_fk"
		}),
	check("corsair_events_id_not_null", sql`NOT NULL id`),
	check("corsair_events_created_at_not_null", sql`NOT NULL created_at`),
	check("corsair_events_updated_at_not_null", sql`NOT NULL updated_at`),
	check("corsair_events_account_id_not_null", sql`NOT NULL account_id`),
	check("corsair_events_event_type_not_null", sql`NOT NULL event_type`),
	check("corsair_events_payload_not_null", sql`NOT NULL payload`),
]);
