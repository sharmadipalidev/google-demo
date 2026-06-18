import { relations } from "drizzle-orm/relations";
import { corsairIntegrations, corsairAccounts, corsairEntities, corsairEvents } from "./schema";

export const corsairAccountsRelations = relations(corsairAccounts, ({one, many}) => ({
	corsairIntegration: one(corsairIntegrations, {
		fields: [corsairAccounts.integrationId],
		references: [corsairIntegrations.id]
	}),
	corsairEntities: many(corsairEntities),
	corsairEvents: many(corsairEvents),
}));

export const corsairIntegrationsRelations = relations(corsairIntegrations, ({many}) => ({
	corsairAccounts: many(corsairAccounts),
}));

export const corsairEntitiesRelations = relations(corsairEntities, ({one}) => ({
	corsairAccount: one(corsairAccounts, {
		fields: [corsairEntities.accountId],
		references: [corsairAccounts.id]
	}),
}));

export const corsairEventsRelations = relations(corsairEvents, ({one}) => ({
	corsairAccount: one(corsairAccounts, {
		fields: [corsairEvents.accountId],
		references: [corsairAccounts.id]
	}),
}));