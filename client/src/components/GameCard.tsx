import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
}

const gameIcons: Record<string, string> = {
  slots: "🎰",
  blackjack: "🃏",
  roulette: "🎯",
  poker: "♠️",
};

const gameColors: Record<string, string> = {
  slots: "from-casino-gold via-yellow-600 to-orange-600",
  blackjack: "from-green-800 via-green-700 to-emerald-800",
  roulette: "from-red-800 via-red-700 to-red-900",
  poker: "from-purple-800 via-purple-700 to-indigo-800",
};

const gameRoutes: Record<string, string> = {
  slots: "/slots",
  blackjack: "/blackjack",
  roulette: "/roulette", 
  poker: "/poker",
};

export default function GameCard({ game }: GameCardProps) {
  const icon = gameIcons[game.type] || "🎮";
  const colorClass = gameColors[game.type] || "from-slate-600 to-slate-800";
  const route = gameRoutes[game.type] || "/";

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "slots":
        return "default";
      case "blackjack":
        return "destructive";
      case "roulette":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getBadgeText = (type: string) => {
    switch (type) {
      case "slots":
        return "Hot";
      case "blackjack":
        return "Live";
      case "roulette":
        return "Popular";
      default:
        return "New";
    }
  };

  return (
    <Card className="casino-card border-slate-700 overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group">
      <div className={`relative h-48 bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant={getBadgeVariant(game.type)} className="text-xs font-semibold">
            {getBadgeText(game.type)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
        <p className="text-slate-400 mb-4 capitalize">
          {game.type === "slots" && "Progressive jackpot slots with mega wins"}
          {game.type === "blackjack" && "Beat the dealer with perfect strategy"}
          {game.type === "roulette" && "Spin the wheel and hit your lucky number"}
          {game.type === "poker" && "Texas Hold'em with live opponents"}
        </p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-slate-500">Min Bet: ${game.minBet}</span>
          <span className="casino-gold font-semibold">RTP: {game.rtp}%</span>
        </div>
        <Link href={route}>
          <Button className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500 transition-colors">
            Play Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
