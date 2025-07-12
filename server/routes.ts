import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertGameSchema, insertTransactionSchema, insertGameResultSchema } from "@shared/schema";
import { z } from "zod";

const placeBetSchema = z.object({
  gameId: z.number(),
  amount: z.string(),
});

const slotSpinSchema = z.object({
  gameId: z.number(),
  betAmount: z.string(),
});

const blackjackActionSchema = z.object({
  gameId: z.number(),
  action: z.enum(["deal", "hit", "stand", "double", "split"]),
  betAmount: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed initial games
  const games = await storage.getGames();
  if (games.length === 0) {
    // Classic Fruit Slots
    await storage.createGame({
      name: "Lucky Sevens",
      type: "slots",
      subType: "classic",
      theme: "fruit",
      minBet: "0.05",
      maxBet: "50.00",
      rtp: "95.50",
      reels: 3,
      rows: 3,
      paylines: 5,
      maxMultiplier: 500,
      features: ["wilds", "multipliers"],
    });

    // Adventure Video Slots
    await storage.createGame({
      name: "Treasure Quest",
      type: "slots",
      subType: "video",
      theme: "adventure",
      minBet: "0.10",
      maxBet: "100.00",
      rtp: "96.80",
      reels: 5,
      rows: 3,
      paylines: 25,
      maxMultiplier: 2000,
      features: ["wilds", "scatters", "free_spins", "bonus_rounds"],
    });

    // Egyptian Themed Slots
    await storage.createGame({
      name: "Pharaoh's Gold",
      type: "slots",
      subType: "video",
      theme: "egyptian",
      minBet: "0.20",
      maxBet: "200.00",
      rtp: "97.10",
      reels: 5,
      rows: 4,
      paylines: 40,
      maxMultiplier: 5000,
      features: ["expanding_wilds", "scatters", "free_spins", "multipliers"],
    });

    // Megaways Slots
    await storage.createGame({
      name: "Diamond Strike Megaways",
      type: "slots",
      subType: "megaways",
      theme: "gems",
      minBet: "0.25",
      maxBet: "125.00",
      rtp: "96.50",
      reels: 6,
      rows: 7,
      paylines: 117649, // Max megaways
      maxMultiplier: 10000,
      features: ["cascading_reels", "multipliers", "free_spins", "bonus_buy"],
    });

    // Progressive Jackpot Slots
    await storage.createGame({
      name: "Mega Fortune",
      type: "slots",
      subType: "progressive",
      theme: "luxury",
      minBet: "0.50",
      maxBet: "500.00",
      rtp: "96.60",
      reels: 5,
      rows: 3,
      paylines: 25,
      maxMultiplier: 1000000,
      features: ["progressive_jackpot", "bonus_wheel", "free_spins", "wilds"],
    });

    // Fantasy Theme Slots
    await storage.createGame({
      name: "Dragon's Realm",
      type: "slots",
      subType: "video",
      theme: "fantasy",
      minBet: "0.15",
      maxBet: "150.00",
      rtp: "96.90",
      reels: 5,
      rows: 4,
      paylines: 50,
      maxMultiplier: 3000,
      features: ["stacked_wilds", "scatters", "free_spins", "pick_bonus"],
    });
    
    await storage.createGame({
      name: "Classic Blackjack",
      type: "blackjack",
      minBet: "5.00",
      maxBet: "500.00",
      rtp: "99.50",
    });
    
    await storage.createGame({
      name: "European Roulette",
      type: "roulette",
      minBet: "1.00",
      maxBet: "1000.00",
      rtp: "97.30",
    });
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Game routes
  app.get('/api/games', async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/games/:id', async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // User stats route
  app.get('/api/users/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Slots game route
  app.post('/api/games/slots/spin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameId, betAmount } = slotSpinSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const bet = parseFloat(betAmount);
      const currentBalance = parseFloat(user.balance || '0');

      if (bet > currentBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Generate random slot result
      const symbols = ['🍒', '🍋', '🔔', '⭐', '💎'];
      const reels = Array(5).fill(null).map(() => 
        symbols[Math.floor(Math.random() * symbols.length)]
      );

      // Simple winning logic - 3 or more matching symbols
      const symbolCounts = reels.reduce((acc, symbol) => {
        acc[symbol] = (acc[symbol] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let winMultiplier = 0;
      const maxCount = Math.max(...Object.values(symbolCounts));
      
      if (maxCount >= 3) {
        const winningSymbol = Object.keys(symbolCounts).find(
          symbol => symbolCounts[symbol] === maxCount
        );
        
        // Different multipliers for different symbols
        const multipliers: Record<string, number> = {
          '🍒': 5, '🍋': 10, '🔔': 25, '⭐': 50, '💎': 100
        };
        
        winMultiplier = multipliers[winningSymbol!] || 5;
        if (maxCount === 4) winMultiplier *= 2;
        if (maxCount === 5) winMultiplier *= 5;
      }

      const winAmount = bet * winMultiplier;
      const newBalance = currentBalance - bet + winAmount;

      // Update user balance
      await storage.updateUserBalance(userId, newBalance.toFixed(2));

      // Create transaction
      await storage.createTransaction({
        userId,
        gameId,
        type: 'bet',
        amount: (-bet).toFixed(2),
        balanceBefore: currentBalance.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        description: `Slot spin - ${reels.join('')}`,
      });

      if (winAmount > 0) {
        await storage.createTransaction({
          userId,
          gameId,
          type: 'win',
          amount: winAmount.toFixed(2),
          balanceBefore: currentBalance.toFixed(2),
          balanceAfter: newBalance.toFixed(2),
          description: `Slot win - ${reels.join('')}`,
        });
      }

      // Create game result
      await storage.createGameResult({
        userId,
        gameId,
        betAmount: bet.toFixed(2),
        winAmount: winAmount.toFixed(2),
        gameData: { reels, multiplier: winMultiplier },
        result: winAmount > 0 ? 'win' : 'loss',
      });

      res.json({
        reels,
        winAmount: winAmount.toFixed(2),
        newBalance: newBalance.toFixed(2),
        multiplier: winMultiplier,
      });
    } catch (error) {
      console.error("Error processing slot spin:", error);
      res.status(500).json({ message: "Failed to process slot spin" });
    }
  });

  // Blackjack game route
  app.post('/api/games/blackjack/play', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { gameId, action, betAmount } = blackjackActionSchema.parse(req.body);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (action === 'deal' && betAmount) {
        const bet = parseFloat(betAmount);
        const currentBalance = parseFloat(user.balance || '0');

        if (bet > currentBalance) {
          return res.status(400).json({ message: "Insufficient balance" });
        }

        // Generate initial cards
        const deck = [
          'A♠', '2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠',
          'A♥', '2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥',
          'A♣', '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣',
          'A♦', '2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦',
        ];

        // Shuffle deck
        for (let i = deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        const playerCards = [deck.pop()!, deck.pop()!];
        const dealerCards = [deck.pop()!, deck.pop()!];

        // Calculate hand values
        const calculateHandValue = (cards: string[]) => {
          let value = 0;
          let aces = 0;
          
          for (const card of cards) {
            const rank = card.slice(0, -1);
            if (rank === 'A') {
              aces++;
              value += 11;
            } else if (['J', 'Q', 'K'].includes(rank)) {
              value += 10;
            } else {
              value += parseInt(rank);
            }
          }
          
          while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
          }
          
          return value;
        };

        const playerValue = calculateHandValue(playerCards);
        const dealerValue = calculateHandValue([dealerCards[0]]); // Only show first card

        res.json({
          playerCards,
          dealerCards: [dealerCards[0], '?'], // Hide dealer's second card
          playerValue,
          dealerValue,
          gameState: playerValue === 21 ? 'blackjack' : 'playing',
          deck: deck.length,
        });
      } else {
        // Handle other actions (hit, stand, etc.)
        res.json({ message: "Action processed" });
      }
    } catch (error) {
      console.error("Error processing blackjack action:", error);
      res.status(500).json({ message: "Failed to process blackjack action" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      console.error("Error creating game:", error);
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle real-time game updates
        console.log('Received message:', data);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
