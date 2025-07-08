import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Minus, Plus, Play, RotateCcw } from "lucide-react";

interface SlotMachineProps {
  gameId: number;
  minBet: string;
  maxBet: string;
}

export default function SlotMachine({ gameId, minBet, maxBet }: SlotMachineProps) {
  const [reels, setReels] = useState(['🍒', '🍋', '🔔', '⭐', '💎']);
  const [betAmount, setBetAmount] = useState(parseFloat(minBet));
  const [lastWin, setLastWin] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const spinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        "/api/games/slots/spin",
        { gameId, betAmount: betAmount.toFixed(2) }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setReels(data.reels);
      setLastWin(parseFloat(data.winAmount));
      setTotalSpins(prev => prev + 1);
      
      if (parseFloat(data.winAmount) > 0) {
        toast({
          title: "Congratulations!",
          description: `You won $${data.winAmount}!`,
          variant: "default",
        });
      }
      
      // Invalidate user data to update balance
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: error.message || "Failed to spin",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSpinning(false);
    },
  });

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    
    // Animate reels
    const animationInterval = setInterval(() => {
      setReels(prev => prev.map(() => {
        const symbols = ['🍒', '🍋', '🔔', '⭐', '💎', '🍇', '🍊', '7️⃣'];
        return symbols[Math.floor(Math.random() * symbols.length)];
      }));
    }, 100);

    setTimeout(() => {
      clearInterval(animationInterval);
      spinMutation.mutate();
    }, 1500);
  };

  const adjustBet = (change: number) => {
    const newBet = betAmount + change;
    const min = parseFloat(minBet);
    const max = parseFloat(maxBet);
    
    if (newBet >= min && newBet <= max) {
      setBetAmount(newBet);
    }
  };

  const quickBets = [1, 5, 10, 25];

  return (
    <Card className="casino-card border-slate-700">
      <CardHeader>
        <CardTitle className="text-center casino-gold flex items-center justify-center">
          🎰 Golden Reels
          <Badge variant="secondary" className="ml-2">Demo</Badge>
        </CardTitle>
        <p className="text-center text-slate-400">Match 3 symbols to win!</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Slot Reels */}
        <div className="casino-dark rounded-xl p-6">
          <div className="grid grid-cols-5 gap-4 mb-6">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={`bg-slate-700 rounded-lg h-20 flex items-center justify-center text-4xl ${
                  isSpinning ? 'animate-pulse' : ''
                }`}
              >
                {symbol}
              </div>
            ))}
          </div>
          
          {/* Payline Indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {Array(5).fill(null).map((_, i) => (
                <div 
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === 2 ? 'bg-casino-gold' : 'bg-casino-gold opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bet Controls */}
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <h4 className="text-white font-semibold mb-3">Bet Amount</h4>
              <div className="flex items-center justify-between mb-3">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => adjustBet(-1)}
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
                  onClick={() => adjustBet(1)}
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

          {/* Game Stats */}
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <h4 className="text-white font-semibold mb-3">Game Stats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Win:</span>
                  <span className="casino-green font-semibold">
                    ${lastWin.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Spins:</span>
                  <span className="text-white">{totalSpins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Win Rate:</span>
                  <span className="text-white">
                    {totalSpins > 0 ? ((lastWin > 0 ? 1 : 0) / totalSpins * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spin Controls */}
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4 flex flex-col justify-center space-y-2">
              <Button
                size="lg"
                className="bg-gradient-to-r from-casino-gold to-yellow-600 text-casino-dark hover:from-yellow-500 hover:to-yellow-700 font-bold transform hover:scale-105 transition-all"
                onClick={handleSpin}
                disabled={isSpinning || spinMutation.isPending}
              >
                {isSpinning ? (
                  <RotateCcw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Play className="mr-2 h-5 w-5" />
                )}
                {isSpinning ? "SPINNING..." : "SPIN"}
              </Button>
              <Button
                variant="outline"
                className="bg-slate-600 hover:bg-slate-500"
                disabled={isSpinning}
              >
                Auto Spin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Paytable */}
        <Card className="bg-slate-700 border-slate-600">
          <CardContent className="p-4">
            <h4 className="text-white font-semibold mb-3">Paytable</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center justify-between bg-slate-600 px-3 py-2 rounded">
                <span>🍒🍒🍒</span>
                <span className="casino-gold font-semibold">5x</span>
              </div>
              <div className="flex items-center justify-between bg-slate-600 px-3 py-2 rounded">
                <span>🍋🍋🍋</span>
                <span className="casino-gold font-semibold">10x</span>
              </div>
              <div className="flex items-center justify-between bg-slate-600 px-3 py-2 rounded">
                <span>🔔🔔🔔</span>
                <span className="casino-gold font-semibold">25x</span>
              </div>
              <div className="flex items-center justify-between bg-slate-600 px-3 py-2 rounded">
                <span>💎💎💎</span>
                <span className="casino-gold font-semibold">100x</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
