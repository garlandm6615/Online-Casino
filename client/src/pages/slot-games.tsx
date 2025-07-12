import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassicSlotMachine from "@/components/ClassicSlotMachine";
import MegawaysSlotMachine from "@/components/MegawaysSlotMachine";
import ProgressiveSlotMachine from "@/components/ProgressiveSlotMachine";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type Game = {
  id: number;
  name: string;
  type: string;
  subType: string;
  theme: string;
  minBet: string;
  maxBet: string;
  rtp: string;
  reels: number;
  rows: number;
  paylines: number;
  maxMultiplier: number;
  features: string[];
  isActive: boolean;
};

export default function SlotGames() {
  const [, params] = useRoute("/slots/:gameId?");
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  if (isLoading || gamesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const slotGames = games?.filter((game: Game) => game.type === 'slots') || [];
  const selectedGameId = params?.gameId ? parseInt(params.gameId) : null;
  const selectedGame = selectedGameId ? slotGames.find(game => game.id === selectedGameId) : null;

  const groupedGames = {
    classic: slotGames.filter(game => game.subType === 'classic'),
    video: slotGames.filter(game => game.subType === 'video'),
    megaways: slotGames.filter(game => game.subType === 'megaways'),
    progressive: slotGames.filter(game => game.subType === 'progressive'),
  };

  const renderSlotMachine = (game: Game) => {
    switch (game.subType) {
      case 'megaways':
        return <MegawaysSlotMachine game={game} />;
      case 'progressive':
        return <ProgressiveSlotMachine game={game} />;
      default:
        return <ClassicSlotMachine game={game} />;
    }
  };

  const getThemeColor = (theme: string) => {
    const colors = {
      fruit: 'bg-orange-100 text-orange-800',
      egyptian: 'bg-yellow-100 text-yellow-800',
      adventure: 'bg-green-100 text-green-800',
      gems: 'bg-purple-100 text-purple-800',
      fantasy: 'bg-blue-100 text-blue-800',
      luxury: 'bg-pink-100 text-pink-800',
    };
    return colors[theme as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (selectedGame) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            ← Back to Slot Games
          </Button>
        </div>
        {renderSlotMachine(selectedGame)}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
          🎰 Slot Games Casino 🎰
        </h1>
        <p className="text-lg text-gray-600">
          Choose from our exciting collection of slot machines
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="classic">Classic</TabsTrigger>
          <TabsTrigger value="video">Video Slots</TabsTrigger>
          <TabsTrigger value="megaways">Megaways</TabsTrigger>
          <TabsTrigger value="progressive">Progressive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.entries(groupedGames).map(([category, categoryGames]) => 
            categoryGames.length > 0 && (
              <div key={category} className="space-y-4">
                <h2 className="text-2xl font-bold capitalize">{category} Slots</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryGames.map((game) => (
                    <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-xl">{game.name}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getThemeColor(game.theme)}>
                            {game.theme}
                          </Badge>
                          <Badge variant="outline">
                            {game.subType}
                          </Badge>
                          <Badge variant="secondary">
                            RTP: {game.rtp}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Min Bet:</span>
                            <div className="font-semibold">${game.minBet}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Max Bet:</span>
                            <div className="font-semibold">${game.maxBet}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Paylines:</span>
                            <div className="font-semibold">{game.paylines.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Max Win:</span>
                            <div className="font-semibold">{game.maxMultiplier}x</div>
                          </div>
                        </div>
                        
                        {game.features && game.features.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm text-gray-600">Features:</span>
                            <div className="flex flex-wrap gap-1">
                              {game.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature.replace('_', ' ')}
                                </Badge>
                              ))}
                              {game.features.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{game.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full"
                          onClick={() => window.location.href = `/slots/${game.id}`}
                        >
                          Play Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </TabsContent>

        {Object.entries(groupedGames).map(([category, categoryGames]) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryGames.map((game) => (
                <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getThemeColor(game.theme)}>
                        {game.theme}
                      </Badge>
                      <Badge variant="outline">
                        {game.subType}
                      </Badge>
                      <Badge variant="secondary">
                        RTP: {game.rtp}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Min Bet:</span>
                        <div className="font-semibold">${game.minBet}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Max Bet:</span>
                        <div className="font-semibold">${game.maxBet}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Paylines:</span>
                        <div className="font-semibold">{game.paylines.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Max Win:</span>
                        <div className="font-semibold">{game.maxMultiplier}x</div>
                      </div>
                    </div>
                    
                    {game.features && game.features.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm text-gray-600">Features:</span>
                        <div className="flex flex-wrap gap-1">
                          {game.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature.replace('_', ' ')}
                            </Badge>
                          ))}
                          {game.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{game.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full"
                      onClick={() => window.location.href = `/slots/${game.id}`}
                    >
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}