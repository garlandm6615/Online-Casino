import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ClassicSlotMachineProps {
  game: {
    id: number;
    name: string;
    minBet: string;
    maxBet: string;
    theme: string;
    reels: number;
    rows: number;
    paylines: number;
    features: string[];
  };
}

const CLASSIC_SYMBOLS = {
  fruit: ['🍒', '🍋', '🍊', '🍇', '🍉', '7️⃣', '💎', '⭐'],
  egyptian: ['🔺', '👁️', '🏺', '🐍', '💰', '👑', '💎', '🌟'],
  adventure: ['🗡️', '🛡️', '💰', '🏰', '🗝️', '💎', '⚡', '🌟'],
  gems: ['💎', '💍', '💰', '🔮', '⭐', '💜', '💙', '💚'],
  fantasy: ['🐉', '🧙‍♂️', '⚔️', '🔮', '🏰', '💎', '⚡', '🌟'],
  luxury: ['💎', '🏆', '💰', '🍾', '🎰', '💍', '⭐', '👑']
};

export default function ClassicSlotMachine({ game }: ClassicSlotMachineProps) {
  const [betAmount, setBetAmount] = useState(parseFloat(game.minBet));
  const [reels, setReels] = useState<string[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<string>('0.00');
  const [winMultiplier, setWinMultiplier] = useState<number>(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const symbols = CLASSIC_SYMBOLS[game.theme as keyof typeof CLASSIC_SYMBOLS] || CLASSIC_SYMBOLS.fruit;

  const generateInitialReels = () => {
    const newReels = [];
    for (let i = 0; i < game.reels; i++) {
      const reel = [];
      for (let j = 0; j < game.rows; j++) {
        reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
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
    },
    onSuccess: (data) => {
      setReels(data.reels);
      setLastWin(data.winAmount);
      setWinMultiplier(data.multiplier);
      setIsSpinning(false);
      
      if (parseFloat(data.winAmount) > 0) {
        toast({
          title: "Congratulations! 🎉",
          description: `You won $${data.winAmount}! (${data.multiplier}x)`,
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-yellow-600">
          {game.name}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {game.paylines} Paylines • RTP: High • Theme: {game.theme}
        </p>
        {game.features && (
          <div className="flex flex-wrap gap-1 justify-center">
            {game.features.map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
              >
                {feature.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Slot Machine Display */}
        <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-6 rounded-lg">
          <div className="bg-black p-4 rounded-lg">
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${game.reels}, 1fr)` }}>
              {reels.map((reel, reelIndex) => (
                <div key={reelIndex} className="space-y-1">
                  {reel.map((symbol, symbolIndex) => (
                    <div
                      key={symbolIndex}
                      className={`
                        w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl
                        ${isSpinning ? 'animate-spin' : ''}
                        border-2 border-yellow-300
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
              <div className="text-2xl font-bold text-green-600">
                WIN: ${lastWin}
              </div>
              {winMultiplier > 1 && (
                <div className="text-lg text-yellow-300">
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
          </div>

          <Button
            onClick={handleSpin}
            disabled={isSpinning || spinMutation.isPending}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3"
            size="lg"
          >
            {isSpinning ? "SPINNING..." : `SPIN - $${betAmount.toFixed(2)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}