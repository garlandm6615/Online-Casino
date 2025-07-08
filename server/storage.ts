import {
  users,
  games,
  transactions,
  gameResults,
  type User,
  type UpsertUser,
  type Game,
  type InsertGame,
  type Transaction,
  type InsertTransaction,
  type GameResult,
  type InsertGameResult,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sum, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserBalance(userId: string, newBalance: string): Promise<User>;
  
  // Game operations
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  // Game result operations
  createGameResult(result: InsertGameResult): Promise<GameResult>;
  getUserGameResults(userId: string, limit?: number): Promise<GameResult[]>;
  getUserStats(userId: string): Promise<{
    totalGames: number;
    totalWins: string;
    totalLosses: string;
    winRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserBalance(userId: string, newBalance: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    return await db.select().from(games).where(eq(games.isActive, true));
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async updateGame(id: number, game: Partial<InsertGame>): Promise<Game> {
    const [updatedGame] = await db
      .update(games)
      .set(game)
      .where(eq(games.id, id))
      .returning();
    return updatedGame;
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  // Game result operations
  async createGameResult(result: InsertGameResult): Promise<GameResult> {
    const [newResult] = await db.insert(gameResults).values(result).returning();
    return newResult;
  }

  async getUserGameResults(userId: string, limit = 10): Promise<GameResult[]> {
    return await db
      .select()
      .from(gameResults)
      .where(eq(gameResults.userId, userId))
      .orderBy(desc(gameResults.createdAt))
      .limit(limit);
  }

  async getUserStats(userId: string): Promise<{
    totalGames: number;
    totalWins: string;
    totalLosses: string;
    winRate: number;
  }> {
    const results = await db
      .select({
        totalGames: count(),
        totalWins: sum(gameResults.winAmount),
        totalLosses: sum(gameResults.betAmount),
      })
      .from(gameResults)
      .where(eq(gameResults.userId, userId));

    const stats = results[0];
    const totalGames = stats.totalGames || 0;
    const totalWins = parseFloat(stats.totalWins || "0");
    const totalLosses = parseFloat(stats.totalLosses || "0");
    const winRate = totalGames > 0 ? (totalWins / totalLosses) * 100 : 0;

    return {
      totalGames,
      totalWins: stats.totalWins || "0.00",
      totalLosses: stats.totalLosses || "0.00",
      winRate: Math.round(winRate * 100) / 100,
    };
  }
}

export const storage = new DatabaseStorage();
