import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface MegawaysSlotMachineProps {
  game: {
    id: number;
    name: string;
    minBet: string;
    maxBet: string;
    theme: string;
    reels: number;
    paylines: number;
    maxMultiplier: number;
    features: string[];
  };
}

const MEGAWAYS_SYMBOLS = {
  gems: ['💎', '💍', '🔮', '⭐', '💜', '💙', '💚', '🟡', '🔴'],
  adventure: ['🗡️', '🛡️', '💰', '🏰', '🗝️', '💎', '⚡', '🌟', '🏺'],
  fantasy: ['🐉', '🧙‍♂️', '⚔️', '🔮', '🏰', '💎', '⚡', '🌟', '🦄']
};

export default function MegawaysSlotMachine({ game }: MegawaysSlotMachineProps) {
  const [betAmount, setBetAmount] = useState(parseFloat(game.minBet));
  const [reels, setReels] = useState<string[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<string>('0.00');
  const [winMultiplier, setWinMultiplier] = useState<number>(0);
  const [activeMegaways, setActiveMegaways] = useState<number>(0);
  const [cascadeCount, setCascadeCount] = useState<number>(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const symbols = MEGAWAYS_SYMBOLS[game.theme as keyof typeof MEGAWAYS_SYMBOLS] || MEGAWAYS_SYMBOLS.gems;

  const generateMegawaysReels = () => {
    const newReels = [];
    let totalWays = 1;
    
    for (let i = 0; i < game.reels; i++) {
      // Random reel height between 2-7 symbols for megaways
      const reelHeight = Math.floor(Math.random() * 6) + 2;
      totalWays *= reelHeight;
      
      const reel = [];
      for (let j = 0; j < reelHeight; j++) {
        reel.push(symbols[Math.floor(Math.random() * symbols.length)]);
      }
      newReels.push(reel);
    }
    
    setActiveMegaways(Math.min(totalWays, 117649)); // Cap at max megaways
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
      setCascadeCount(0);
    },
    onSuccess: (data) => {
      const megawaysReels = generateMegawaysReels();
      setReels(megawaysReels);
      setLastWin(data.winAmount);
      setWinMultiplier(data.multiplier);
      setIsSpinning(false);
      
      // Simulate cascading reels for megaways
      if (parseFloat(data.winAmount) > 0) {
        setCascadeCount(Math.floor(Math.random() * 3) + 1);
        toast({
          title: "MEGAWAYS WIN! 💥",
          description: `${activeMegaways.toLocaleString()} ways • $${data.winAmount} • ${data.multiplier}x`,
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
    setReels(generateMegawaysReels());
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
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {game.name}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Up to {game.paylines.toLocaleString()} Ways to Win • Max Win: {game.maxMultiplier}x
        </p>
        <div className="text-lg font-semibold text-purple-600">
          Current: {activeMegaways.toLocaleString()} MEGAWAYS
        </div>
        {game.features && (
          <div className="flex flex-wrap gap-1 justify-center">
            {game.features.map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
              >
                {feature.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Megaways Display */}
        <div className="bg-gradient-to-b from-purple-600 to-pink-600 p-6 rounded-lg">
          <div className="bg-black p-4 rounded-lg">
            <div className="flex gap-1 justify-center">
              {reels.map((reel, reelIndex) => (
                <div key={reelIndex} className="flex flex-col gap-1">
                  {reel.map((symbol, symbolIndex) => (
                    <div
                      key={symbolIndex}
                      className={`
                        w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-lg flex items-center justify-center text-lg
                        ${isSpinning ? 'animate-bounce' : ''}
                        border-2 border-purple-300 shadow-lg
                        ${cascadeCount > 0 ? 'animate-pulse' : ''}
                      `}
                      style={{
                        animationDelay: `${reelIndex * 100 + symbolIndex * 50}ms`
                      }}
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
                MEGAWAYS WIN: ${lastWin}
              </div>
              {winMultiplier > 1 && (
                <div className="text-xl text-pink-300">
                  {winMultiplier}x MULTIPLIER!
                </div>
              )}
              {cascadeCount > 0 && (
                <div className="text-lg text-cyan-300">
                  {cascadeCount} Cascades!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-purple-100 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Active Ways</div>
            <div className="text-lg font-bold text-purple-600">
              {activeMegaways.toLocaleString()}
            </div>
          </div>
          <div className="bg-pink-100 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Max Multiplier</div>
            <div className="text-lg font-bold text-pink-600">
              {game.maxMultiplier}x
            </div>
          </div>
          <div className="bg-cyan-100 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Last Win</div>
            <div className="text-lg font-bold text-cyan-600">
              ${lastWin}
            </div>
          </div>
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
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg"
            size="lg"
          >
            {isSpinning ? "SPINNING MEGAWAYS..." : `SPIN MEGAWAYS - $${betAmount.toFixed(2)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}