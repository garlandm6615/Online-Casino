import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProgressiveSlotMachineProps {
  game: {
    id: number;
    name: string;
    minBet: string;
    maxBet: string;
    theme: string;
    reels: number;
    rows: number;
    paylines: number;
    maxMultiplier: number;
    features: string[];
  };
}

const LUXURY_SYMBOLS = ['💎', '🏆', '💰', '🍾', '🎰', '💍', '⭐', '👑', '🥂'];

export default function ProgressiveSlotMachine({ game }: ProgressiveSlotMachineProps) {
  const [betAmount, setBetAmount] = useState(parseFloat(game.minBet));
  const [reels, setReels] = useState<string[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<string>('0.00');
  const [winMultiplier, setWinMultiplier] = useState<number>(0);
  const [progressiveJackpot, setProgressiveJackpot] = useState<number>(1250000);
  const [miniJackpot, setMiniJackpot] = useState<number>(12500);
  const [majorJackpot, setMajorJackpot] = useState<number>(125000);
  const [bonusProgress, setBonusProgress] = useState<number>(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update jackpots periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressiveJackpot(prev => prev + Math.random() * 10);
      setMajorJackpot(prev => prev + Math.random() * 2);
      setMiniJackpot(prev => prev + Math.random() * 0.5);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const generateInitialReels = () => {
    const newReels = [];
    for (let i = 0; i < game.reels; i++) {
      const reel = [];
      for (let j = 0; j < game.rows; j++) {
        reel.push(LUXURY_SYMBOLS[Math.floor(Math.random() * LUXURY_SYMBOLS.length)]);
      }
      newReels.push(reel);
    }
    return newReels;
  };

  const spinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/games/slots/spin", {
        gameId: game.id,
        betAmount: betAmount.toFixed(2),
      });
    },
    onMutate: () => {
      setIsSpinning(true);
      setBonusProgress(prev => Math.min(prev + Math.random() * 15, 100));
    },
    onSuccess: (data) => {
      setReels(generateInitialReels());
      setLastWin(data.winAmount);
      setWinMultiplier(data.multiplier);
      setIsSpinning(false);
      
      const winAmount = parseFloat(data.winAmount);
      
      // Check for jackpot wins
      if (winAmount > 50000) {
        toast({
          title: "🎰 MEGA JACKPOT! 🎰",
          description: `PROGRESSIVE JACKPOT HIT! $${winAmount.toLocaleString()}`,
        });
        setProgressiveJackpot(500000); // Reset progressive
      } else if (winAmount > 10000) {
        toast({
          title: "🏆 MAJOR JACKPOT! 🏆",
          description: `Major Jackpot Win! $${winAmount.toLocaleString()}`,
        });
      } else if (winAmount > 1000) {
        toast({
          title: "💰 MINI JACKPOT! 💰",
          description: `Mini Jackpot Win! $${winAmount.toLocaleString()}`,
        });
      } else if (winAmount > 0) {
        toast({
          title: "Winner! 🎉",
          description: `You won $${data.winAmount}! (${data.multiplier}x)`,
        });
      }
      
      // Bonus game trigger
      if (bonusProgress >= 100) {
        setBonusProgress(0);
        toast({
          title: "🎡 BONUS WHEEL TRIGGERED! 🎡",
          description: "Spin the wheel for extra prizes!",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: Error) => {
      setIsSpinning(false);
      toast({
        title: "Spin Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (reels.length === 0) {
    setReels(generateInitialReels());
  }

  const handleSpin = () => {
    if (betAmount < parseFloat(game.minBet) || betAmount > parseFloat(game.maxBet)) {
      toast({
        title: "Invalid Bet",
        description: `Bet must be between $${game.minBet} and $${game.maxBet}`,
        variant: "destructive",
      });
      return;
    }
    spinMutation.mutate();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
          {game.name}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Progressive Jackpot • {game.paylines} Paylines • Max Win: {game.maxMultiplier.toLocaleString()}x
        </p>
        {game.features && (
          <div className="flex flex-wrap gap-1 justify-center">
            {game.features.map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
              >
                {feature.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progressive Jackpot Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg text-center">
            <div className="text-sm font-medium">MEGA</div>
            <div className="text-xl font-bold">
              ${progressiveJackpot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-sm font-medium">MAJOR</div>
            <div className="text-xl font-bold">
              ${majorJackpot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
            <div className="text-sm font-medium">MINI</div>
            <div className="text-xl font-bold">
              ${miniJackpot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Bonus Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Bonus Wheel Progress</span>
            <span>{bonusProgress.toFixed(0)}%</span>
          </div>
          <Progress value={bonusProgress} className="h-3" />
        </div>

        {/* Slot Machine Display */}
        <div className="bg-gradient-to-b from-yellow-400 to-orange-500 p-6 rounded-lg">
          <div className="bg-black p-4 rounded-lg">
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${game.reels}, 1fr)` }}>
              {reels.map((reel, reelIndex) => (
                <div key={reelIndex} className="space-y-1">
                  {reel.map((symbol, symbolIndex) => (
                    <div
                      key={symbolIndex}
                      className={`
                        w-16 h-16 bg-gradient-to-br from-white to-yellow-100 rounded-lg flex items-center justify-center text-2xl
                        ${isSpinning ? 'animate-spin' : ''}
                        border-2 border-yellow-300 shadow-lg
                      `}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Win Display */}
          {parseFloat(lastWin) > 0 && (
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold text-yellow-300 animate-pulse">
                {parseFloat(lastWin) > 50000 ? "🎰 MEGA JACKPOT! 🎰" : 
                 parseFloat(lastWin) > 10000 ? "🏆 MAJOR JACKPOT! 🏆" :
                 parseFloat(lastWin) > 1000 ? "💰 MINI JACKPOT! 💰" : "BIG WIN!"}
              </div>
              <div className="text-2xl font-bold text-white">
                ${lastWin}
              </div>
              {winMultiplier > 1 && (
                <div className="text-xl text-orange-300">
                  {winMultiplier}x Multiplier!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Betting Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium min-w-fit">Bet Amount:</label>
            <Input
              type="number"
              min={game.minBet}
              max={game.maxBet}
              step="0.01"
              value={betAmount}
              onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
              className="flex-1"
            />
            <div className="text-sm text-gray-600 min-w-fit">
              ${game.minBet} - ${game.maxBet}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={() => setBetAmount(parseFloat(game.minBet))}
              variant="outline"
              size="sm"
            >
              Min
            </Button>
            <Button
              onClick={() => setBetAmount(parseFloat(game.maxBet))}
              variant="outline"
              size="sm"
            >
              Max
            </Button>
            <Button
              onClick={() => setBetAmount(betAmount * 2)}
              variant="outline"
              size="sm"
              disabled={betAmount * 2 > parseFloat(game.maxBet)}
            >
              Double
            </Button>
          </div>

          <Button
            onClick={handleSpin}
            disabled={isSpinning || spinMutation.isPending}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 text-lg animate-pulse"
            size="lg"
          >
            {isSpinning ? "SPINNING FOR JACKPOT..." : `SPIN FOR JACKPOT - $${betAmount.toFixed(2)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}