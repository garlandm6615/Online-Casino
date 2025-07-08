import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("1000.00"),
  totalWins: decimal("total_wins", { precision: 10, scale: 2 }).default("0.00"),
  totalLosses: decimal("total_losses", { precision: 10, scale: 2 }).default("0.00"),
  gamesPlayed: integer("games_played").default(0),
  biggestWin: decimal("biggest_win", { precision: 10, scale: 2 }).default("0.00"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // slots, blackjack, roulette
  minBet: decimal("min_bet", { precision: 10, scale: 2 }).notNull(),
  maxBet: decimal("max_bet", { precision: 10, scale: 2 }).notNull(),
  rtp: decimal("rtp", { precision: 5, scale: 2 }).notNull(), // Return to Player percentage
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").references(() => games.id),
  type: varchar("type", { length: 20 }).notNull(), // bet, win, deposit, withdrawal
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameResults = pgTable("game_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  betAmount: decimal("bet_amount", { precision: 10, scale: 2 }).notNull(),
  winAmount: decimal("win_amount", { precision: 10, scale: 2 }).notNull(),
  gameData: jsonb("game_data"), // Store game-specific data (cards, reels, etc.)
  result: varchar("result", { length: 20 }).notNull(), // win, loss, push
  createdAt: timestamp("created_at").defaultNow(),
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertGameResultSchema = createInsertSchema(gameResults).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertGameResult = z.infer<typeof insertGameResultSchema>;
export type GameResult = typeof gameResults.$inferSelect;
