import { relations } from "drizzle-orm";
import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { createId as cuid } from "@paralleldrive/cuid2";

const timestamps = {
  updated_at: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  created_at: t.timestamp({ mode: "date" }).defaultNow().notNull(),
  deleted_at: t.timestamp({ mode: "date" }),
};

export const users = table("users", {
  id: t.serial().primaryKey(),
  name: t.varchar("name", { length: 256 }),
  email: t.varchar("email", { length: 256 }).notNull().unique(),
  isEmailVerified: t.boolean("is_email_verified").default(false),
  ...timestamps,
});

export const usersRelations = relations(users, ({ one, many }) => ({
  password: one(passwords),
  sessions: many(sessions),
  tradeAccounts: many(tradeAccounts),
}));

export const passwords = table("passwords", {
  hash: t.text("hash").notNull(),
  userId: t
    .integer("user_id")
    .references(() => users.id)
    .notNull(),
});

export const passwordsRelations = relations(passwords, ({ one }) => ({
  user: one(users, { fields: [passwords.userId], references: [users.id] }),
}));

export const sessions = table("sessions", {
  id: t
    .varchar({ length: 256 })
    .primaryKey()
    .$default(() => cuid()),
  userId: t
    .integer("user_id")
    .references(() => users.id)
    .notNull(),
  expirationDate: t.timestamp({ mode: "date" }).notNull(),
  ...timestamps,
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const tradeAccounts = table("trade_accounts", {
  id: t.serial().primaryKey(),
  userId: t.integer("user_id").references(() => users.id),
  type: t.varchar({ length: 256 }).notNull().default("ANGLEONE"),
  name: t.varchar({ length: 256 }),
  clientId: t.varchar("client_id", { length: 256 }).notNull(), // trade account's user id (angelone client code)
  authToken: t.text("auth_token").notNull(),
  refreshToken: t.text("refresh_token").notNull(),
  feedToken: t.text("feed_token"),
  ...timestamps,
});

export const tradeAccountsRelations = relations(tradeAccounts, ({ one }) => ({
  user: one(users, { fields: [tradeAccounts.userId], references: [users.id] }),
}));
