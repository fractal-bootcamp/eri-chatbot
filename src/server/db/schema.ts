// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Message, Session, Bot, User } from "~/types";



export const messagesTable = sqliteTable("messages", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(),
  createAt: int("create_at", { mode: "timestamp" }).notNull(),
  session: text("session").references(() => sessionsTable.id),
});

export const sessionsTable = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  createdAt: int("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(() => new Date()),
  endedAt: int("ended_at", { mode: "timestamp" }),
});

export const botsTable = sqliteTable("bots", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  model: text("model").notNull(),
});

export const usersTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
});


