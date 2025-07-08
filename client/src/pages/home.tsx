import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import GameCard from "@/components/GameCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Trophy, Star } from "lucide-react";
import type { Game } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
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

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ["/api/games"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen casino-dark flex items-center justify-center">
      <div className="text-casino-gold">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen casino-dark text-white">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:pl-64">
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-casino-dark via-slate-800 to-casino-card"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="text-white">Welcome to </span>
                  <span className="casino-gold">Royal Casino</span>
                </h1>
                <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
                  Experience the thrill of Las Vegas from anywhere. Play slots, blackjack, roulette, and more with fair gaming and instant payouts.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    size="lg"
                    className="bg-casino-gold text-casino-dark hover:bg-yellow-500 transform hover:scale-105 transition-all"
                  >
                    Start Playing Now
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-casino-gold casino-gold hover:bg-casino-gold hover:text-casino-dark"
                  >
                    Claim Bonus
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Games */}
          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Featured Games</h2>
                <p className="text-slate-400 text-lg">Choose from our premium selection of casino games</p>
              </div>

              {gamesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="casino-card border-slate-700">
                      <Skeleton className="h-48 w-full" />
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-4" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {games?.map((game: Game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Live Casino Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Live Casino</h2>
                <p className="text-slate-400 text-lg">Play with real dealers in real-time</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Game Preview */}
                <Card className="casino-card border-slate-700 overflow-hidden">
                  <div className="relative h-64 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">👩‍💼</div>
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2 inline-block">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></div>
                          LIVE
                        </div>
                      </div>
                      <p className="text-white font-semibold">Dealer: Sarah</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Live Blackjack VIP</h3>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400">Players: 5/7</span>
                      <span className="casino-gold font-semibold">Stakes: $25 - $500</span>
                    </div>
                    <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                      Join Table
                    </Button>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="space-y-6">
                  <Card className="casino-card border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="mr-2 h-5 w-5 casino-gold" />
                        Casino Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4 text-blue-400" />
                          <span className="text-slate-400">Players Online</span>
                        </div>
                        <span className="text-white font-semibold">2,847</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Trophy className="mr-2 h-4 w-4 casino-gold" />
                          <span className="text-slate-400">Today's Jackpot</span>
                        </div>
                        <span className="casino-gold font-semibold">$2.4M</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="mr-2 h-4 w-4 casino-green" />
                          <span className="text-slate-400">Happy Winners</span>
                        </div>
                        <span className="casino-green font-semibold">156</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="casino-card border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Winners</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-casino-gold to-yellow-600 rounded-full flex items-center justify-center text-casino-dark font-bold text-sm">
                            JD
                          </div>
                          <div>
                            <p className="text-white font-medium">John D.</p>
                            <p className="text-slate-400 text-sm">Golden Reels</p>
                          </div>
                        </div>
                        <div className="casino-green font-bold">$12,450</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-casino-gold to-yellow-600 rounded-full flex items-center justify-center text-casino-dark font-bold text-sm">
                            SM
                          </div>
                          <div>
                            <p className="text-white font-medium">Sarah M.</p>
                            <p className="text-slate-400 text-sm">Live Blackjack</p>
                          </div>
                        </div>
                        <div className="casino-green font-bold">$3,200</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-casino-gold to-yellow-600 rounded-full flex items-center justify-center text-casino-dark font-bold text-sm">
                            AL
                          </div>
                          <div>
                            <p className="text-white font-medium">Alex L.</p>
                            <p className="text-slate-400 text-sm">European Roulette</p>
                          </div>
                        </div>
                        <div className="casino-green font-bold">$8,750</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Promotions */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-white mb-4">Current Promotions</h2>
                <p className="text-slate-400 text-lg">Boost your gameplay with our exclusive offers</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Welcome Bonus */}
                <div className="bg-gradient-to-br from-casino-gold to-yellow-600 rounded-2xl p-1">
                  <Card className="casino-card rounded-xl h-full">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-2">🎁</div>
                      <h3 className="text-xl font-bold text-white mb-2">Welcome Bonus</h3>
                      <div className="text-3xl font-bold casino-gold mb-2">200%</div>
                      <p className="text-slate-400 mb-4">Up to $2,000 + 100 Free Spins</p>
                      <Button className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500">
                        Claim Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Cashback */}
                <Card className="casino-card border-casino-green">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">💰</div>
                    <h3 className="text-xl font-bold text-white mb-2">Daily Cashback</h3>
                    <div className="text-3xl font-bold casino-green mb-2">10%</div>
                    <p className="text-slate-400 mb-4">On all losses, every day</p>
                    <Button className="w-full bg-casino-green text-white hover:bg-emerald-600">
                      Activate
                    </Button>
                  </CardContent>
                </Card>

                {/* VIP Program */}
                <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">👑</div>
                    <h3 className="text-xl font-bold mb-2">VIP Club</h3>
                    <div className="text-2xl font-bold casino-gold mb-2">Exclusive</div>
                    <p className="text-purple-200 mb-4">Premium rewards & benefits</p>
                    <Button className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
