import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Minus, Plus, Play } from "lucide-react";

interface BlackjackGameProps {
  gameId: number;
  minBet: string;
  maxBet: string;
}

export default function BlackjackGame({ gameId, minBet, maxBet }: BlackjackGameProps) {
  const [betAmount, setBetAmount] = useState(parseFloat(minBet));
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'finished'>('betting');
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [dealerCards, setDealerCards] = useState<string[]>([]);
  const [playerValue, setPlayerValue] = useState(0);
  const [dealerValue, setDealerValue] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dealMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        "/api/games/blackjack/play",
        { gameId, action: 'deal', betAmount: betAmount.toFixed(2) }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setPlayerCards(data.playerCards);
      setDealerCards(data.dealerCards);
      setPlayerValue(data.playerValue);
      setDealerValue(data.dealerValue);
      setGameState(data.gameState === 'blackjack' ? 'finished' : 'playing');
      
      if (data.gameState === 'blackjack') {
        toast({
          title: "Blackjack!",
          description: "You got 21! Congratulations!",
          variant: "default",
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to deal cards",
        variant: "destructive",
      });
    },
  });

  const adjustBet = (change: number) => {
    const newBet = betAmount + change;
    const min = parseFloat(minBet);
    const max = parseFloat(maxBet);
    
    if (newBet >= min && newBet <= max) {
      setBetAmount(newBet);
    }
  };

  const handleDeal = () => {
    dealMutation.mutate();
  };

  const handleNewGame = () => {
    setGameState('betting');
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerValue(0);
    setDealerValue(0);
  };

  const quickBets = [5, 10, 25, 50];

  return (
    <Card className="casino-card border-slate-700">
      <CardHeader>
        <CardTitle className="text-center casino-gold flex items-center justify-center">
          🃏 Classic Blackjack
          <Badge variant="destructive" className="ml-2">Live</Badge>
        </CardTitle>
        <p className="text-center text-slate-400">Beat the dealer! Get as close to 21 as possible.</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Game Table */}
        <div className="casino-dark rounded-xl p-6 space-y-6">
          {/* Dealer's Hand */}
          <div className="text-center">
            <h3 className="text-white font-semibold mb-3">Dealer's Hand ({dealerValue})</h3>
            <div className="flex justify-center space-x-2 mb-4">
              {dealerCards.map((card, index) => (
                <div
                  key={index}
                  className="w-16 h-24 bg-white rounded-lg flex items-center justify-center text-lg font-bold text-black border-2 border-casino-gold"
                >
                  {card === '?' ? '?' : card}
                </div>
              ))}
              {dealerCards.length === 0 && (
                <div className="text-slate-400 italic">Waiting for cards...</div>
              )}
            </div>
          </div>

          {/* Player's Hand */}
          <div className="text-center">
            <h3 className="text-white font-semibold mb-3">Your Hand ({playerValue})</h3>
            <div className="flex justify-center space-x-2 mb-4">
              {playerCards.map((card, index) => (
                <div
                  key={index}
                  className="w-16 h-24 bg-white rounded-lg flex items-center justify-center text-lg font-bold text-black border-2 border-casino-gold"
                >
                  {card}
                </div>
              ))}
              {playerCards.length === 0 && (
                <div className="text-slate-400 italic">Waiting for cards...</div>
              )}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        {gameState === 'betting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bet Controls */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <h4 className="text-white font-semibold mb-3">Place Your Bet</h4>
                <div className="flex items-center justify-between mb-3">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => adjustBet(-5)}
                    disabled={betAmount <= parseFloat(minBet)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="casino-gold font-bold text-xl">
                    ${betAmount.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    className="bg-casino-green hover:bg-green-600"
                    onClick={() => adjustBet(5)}
                    disabled={betAmount >= parseFloat(maxBet)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickBets.map((amount) => (
                    <Button
                      key={amount}
                      size="sm"
                      variant={betAmount === amount ? "default" : "outline"}
                      className={betAmount === amount ? "bg-casino-gold text-casino-dark" : ""}
                      onClick={() => setBetAmount(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deal Button */}
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4 flex flex-col justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-casino-gold to-yellow-600 text-casino-dark hover:from-yellow-500 hover:to-yellow-700 font-bold transform hover:scale-105 transition-all"
                  onClick={handleDeal}
                  disabled={dealMutation.isPending}
                >
                  <Play className="mr-2 h-5 w-5" />
                  {dealMutation.isPending ? "Dealing..." : "Deal Cards"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Playing Controls */}
        {gameState === 'playing' && (
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              className="bg-casino-green hover:bg-green-600"
              disabled
            >
              Hit
            </Button>
            <Button
              size="lg"
              className="bg-casino-red hover:bg-red-600"
              disabled
            >
              Stand
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled
            >
              Double Down
            </Button>
          </div>
        )}

        {/* Game Finished */}
        {gameState === 'finished' && (
          <div className="text-center space-y-4">
            <div className="text-xl font-bold casino-gold">
              {playerValue === 21 ? "Blackjack! You Win!" : "Hand Complete"}
            </div>
            <Button
              size="lg"
              className="bg-casino-gold text-casino-dark hover:bg-yellow-500"
              onClick={handleNewGame}
            >
              New Game
            </Button>
          </div>
        )}

        {/* Game Rules */}
        <Card className="bg-slate-700 border-slate-600">
          <CardContent className="p-4">
            <h4 className="text-white font-semibold mb-3">How to Play</h4>
            <div className="text-sm text-slate-400 space-y-1">
              <p>• Get as close to 21 as possible without going over</p>
              <p>• Face cards (J, Q, K) are worth 10 points</p>
              <p>• Aces are worth 1 or 11 points (whichever is better)</p>
              <p>• Beat the dealer's hand to win</p>
              <p>• Blackjack (21 with 2 cards) pays 3:2</p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
