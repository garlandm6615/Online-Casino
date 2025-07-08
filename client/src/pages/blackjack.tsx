import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import BlackjackGame from "@/components/BlackjackGame";
import { Skeleton } from "@/components/ui/skeleton";
import type { Game } from "@shared/schema";

export default function Blackjack() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const blackjackGame = games?.find((game: Game) => game.type === 'blackjack');

  return (
    <div className="min-h-screen casino-dark text-white">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:pl-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">🃏 Blackjack</h1>
              <p className="text-slate-400">Beat the dealer and get as close to 21 as possible!</p>
            </div>

            {gamesLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-96 w-full casino-card" />
              </div>
            ) : blackjackGame ? (
              <BlackjackGame
                gameId={blackjackGame.id}
                minBet={blackjackGame.minBet}
                maxBet={blackjackGame.maxBet}
              />
            ) : (
              <div className="text-center text-slate-400">
                No blackjack games available at the moment.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
